package cloud

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sort"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
	"golang.org/x/oauth2"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

type Usecase struct {
	fileRepo    FileRepository
	userRepo    UserRepository
	oauthConfig *oauth2.Config
	fileUsecase FileUsecase
}

func NewUsecase(oauthConfig *oauth2.Config, fileRepo FileRepository, fileUsecase FileUsecase, userRepo UserRepository) *Usecase {
	return &Usecase{
		fileRepo:    fileRepo,
		userRepo:    userRepo,
		oauthConfig: oauthConfig,
		fileUsecase: fileUsecase,
	}
}

func (uc *Usecase) CloudConnect(ctx context.Context, token *oauth2.Token) error {
	client := uc.oauthConfig.Client(context.Background(), token)
	srv, err := drive.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		log.Println("Unable to create Drive service", err)
		return err
	}

	about, err := srv.About.Get().Fields("user(emailAddress)").Do()
	if err != nil {
		log.Println("Unable to retrieve user info", err)
		return err
	}

	cloudUserEmail := about.User.EmailAddress

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}

	exists, err := uc.userRepo.CheckCloudExists(ctx, cloudUserEmail, user)
	if err != nil {
		log.Println("CheckCloudExists err:", err)
		return err
	}
	if exists {
		log.Println("Token already exists")
		return nil
	}

	err = uc.userRepo.AddTokenToUser(ctx, token, cloudUserEmail, fileDomain.GoogleDrive, user)
	if err != nil {
		log.Println("AddTokenToUser err:", err)
		return err
	}

	rootFolderID := "root"

	files, err := srv.Files.List().Q("'" + rootFolderID + "' in parents").Fields("files(id, name, mimeType, createdTime, size)").Do()
	if err != nil {
		log.Fatalf("Unable to retrieve files: %v", err)
	}

	var fileList []fileDomain.File

	uc.fillFilesRecursively(ctx, srv, files.Files, "", user, cloudUserEmail, &fileList)

	for _, file := range fileList {
		err := uc.fileRepo.CreateFile(ctx, file)
		if err != nil {
			return err
		}
	}

	go uc.downloadAndUploadFiles(context.Background(), srv, fileList)

	return nil
}

func (uc *Usecase) UpdateAllTokens(ctx context.Context, user *cleveruser.User) error {
	for i, cloud := range user.ConnectedClouds {
		tokenSource := uc.oauthConfig.TokenSource(ctx, cloud.Token)
		newToken, err := tokenSource.Token()
		if err != nil {
			log.Println("Failed to refresh token for cloud", cloud.Cloud, "and email", cloud.CloudEmail, ":", err)
			return err
		}

		user.ConnectedClouds[i].Token = newToken

		err = uc.userRepo.UpdateUser(ctx, *user)
		if err != nil {
			log.Println("Failed to update user with refreshed token for cloud", cloud.Cloud, "and email", cloud.CloudEmail, ":", err)
			return err
		}
	}
	return nil
}

func (uc *Usecase) RefreshConnect(ctx context.Context, disk file.DiskType, cloudEmail string) error {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}

	err := uc.UpdateAllTokens(ctx, &user)
	if err != nil {
		log.Println("UpdateAllTokens, err:", err)
		return err
	}

	var token *oauth2.Token = nil
	for _, cloud := range user.ConnectedClouds {
		if cloud.CloudEmail == cloudEmail && cloud.Cloud == disk {
			token = cloud.Token
			break
		}
	}

	if token == nil {
		log.Println("requested disk and cloudEmail not found: token nil")
		return fmt.Errorf("requested disk and cloudEmail not found: token nil")
	}

	client := uc.oauthConfig.Client(context.Background(), token)
	srv, err := drive.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		log.Println("Unable to create Drive service", err)
		return err
	}

	rootFolderID := "root"

	files, err := srv.Files.List().Q("'" + rootFolderID + "' in parents").Fields("files(id, name, mimeType, createdTime, size)").Do()
	if err != nil {
		log.Fatalf("Unable to retrieve files: %v", err)
	}

	var fileList []fileDomain.File

	uc.fillFilesRecursively(ctx, srv, files.Files, "", user, cloudEmail, &fileList)

	printPaths(fileList, "fileList 1")

	currentFiles, err := uc.fileUsecase.GetFiles(ctx, fileDomain.FileOptions{
		UserID:                user.ID,
		CloudEmail:            cloudEmail,
		Disk:                  string(disk),
		FirstNesting:          false,
		DirsRequired:          true,
		FilesRequired:         true,
		SharedRequired:        true,
		PersonalRequired:      true,
		ExternalDisklRequired: true,
		InternalDisklRequired: false,
	})
	if err != nil {
		log.Println("Failed to retrieve current files from repository:", err)
		return err
	}

	printPaths(currentFiles, "currentFiles 1")

	currentFileMap := make(map[string]fileDomain.File)
	for _, f := range currentFiles {
		currentFileMap[f.CloudID] = f
	}

	cloudFileMap := make(map[string]fileDomain.File)
	for _, f := range fileList {
		cloudFileMap[f.CloudID] = f
	}

	var filesToDelete []string
	var filesToAdd []fileDomain.File
	for id, f := range currentFileMap {
		if _, exists := cloudFileMap[id]; !exists {
			filesToDelete = append(filesToDelete, f.Path)
		}
	}
	for id, f := range cloudFileMap {
		if _, exists := currentFileMap[id]; !exists {
			filesToAdd = append(filesToAdd, f)
		}
	}

	if err := uc.fileUsecase.DeleteFiles(ctx, filesToDelete); err != nil {
		log.Println("Failed to delete files:", err)
		return err
	}

	sort.Slice(filesToAdd, func(i, j int) bool {
		countI := strings.Count(filesToAdd[i].Path, "/")
		countJ := strings.Count(filesToAdd[j].Path, "/")
		if countI == countJ {
			return filesToAdd[i].IsDir && !filesToAdd[j].IsDir
		}
		return countI < countJ
	})

	for _, f := range filesToAdd {
		if f.IsDir {
			log.Println("create dir:", f.Path)
			_, err := uc.fileUsecase.CreateDir(ctx, f)
			if err != nil {
				log.Println("Failed to create directory:", err)
				return err
			}
		} else {
			fileReader, err := srv.Files.Get(f.CloudID).Download()
			if err != nil {
				log.Printf("Unable to download file %s: %v", f.Path, err)
				continue
			}
			_, err = uc.fileUsecase.Upload(ctx, fileReader.Body, f)
			if err != nil {
				log.Println("Failed to upload file:", err)
				continue
			}
		}
	}

	return nil
}

func (uc *Usecase) GetToken(ctx context.Context, cloudEmail string, cloudID string) (string, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return "", sharederrors.ErrUserNotFoundInContext
	}

	err := uc.UpdateAllTokens(ctx, &user)
	if err != nil {
		log.Println("UpdateAllTokens err:", err)
		return "", err
	}

	cloudFile, err := uc.fileRepo.GetFileByCloudID(ctx, cloudID)
	if err != nil {
		return "", err
	}

	pathComponents := strings.Split(cloudFile.Path, "/")

	isShare := false
	if len(pathComponents) > 2 {
		fileTmpShare, err := uc.fileRepo.GetFileByPath(ctx, "/"+pathComponents[1], "")
		if err != nil {
			log.Println("GetFileByPath err:", err)
			return "", err
		}

		_, err = uc.fileRepo.GetSharedDir(ctx, fileTmpShare.ID, user.ID)
		if err != nil {
			if !errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("GetSharedDir err:", err)
				return "", err
			}
			if errors.Is(err, fileDomain.ErrNotFound) {
				isShare = false
			}
		} else {
			isShare = true
		}
	}

	if cloudFile.UserID != user.ID || isShare {
		log.Println("request to file, but owner invalid")
		return "", fmt.Errorf("request to file, but owner invalid")
	}
	for _, cloud := range user.ConnectedClouds {
		if cloud.CloudEmail == cloudEmail {
			return cloud.Token.AccessToken, nil
		}
	}
	log.Println("not found cloud email")
	return "", fmt.Errorf("not found cloud email")

}

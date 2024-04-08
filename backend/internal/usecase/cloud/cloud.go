package cloud

import (
	"context"
	"log"

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

func (uc *Usecase) RefreshConnect(ctx context.Context, disk file.DiskType, cloudEmail string) (string, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return "", sharederrors.ErrUserNotFoundInContext
	}

	token, err := uc.getToken(ctx, cloudEmail, disk, user)
	if err != nil {
		log.Println("RefreshConnect: getToken: err", err)
	}

	client := uc.oauthConfig.Client(context.Background(), token)
	srv, err := drive.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		log.Println("Unable to create Drive service", err)
		return "", err
	}

	about, err := srv.About.Get().Fields("user(emailAddress)").Do()
	if err != nil {
		log.Println("Unable to retrieve user info", err)
		return "", err
	}

	return about.User.EmailAddress, nil
}

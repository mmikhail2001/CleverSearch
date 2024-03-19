package file

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/notifier"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
	"github.com/google/uuid"
)

var eventChangeStatus = "changeStatus"

type Usecase struct {
	repo          Repository
	notifyUsecase NotifyUsecase
	userUsecase   UserUsecase
}

func NewUsecase(repo Repository, notifyUsecase NotifyUsecase, userUsecase UserUsecase) *Usecase {
	return &Usecase{
		repo:          repo,
		notifyUsecase: notifyUsecase,
		userUsecase:   userUsecase,
	}
}

func getFileExtension(filename string) string {
	parts := strings.Split(filename, ".")
	if len(parts) > 1 {
		return parts[len(parts)-1]
	}
	return ""
}

func (uc *Usecase) Upload(ctx context.Context, fileReader io.Reader, file fileDomain.File) (fileDomain.File, error) {
	if !strings.HasPrefix(file.Path, "/") {
		log.Printf("Directory path [%s] does not start with /\n", file.Path)
		return fileDomain.File{}, fileDomain.ErrDirectoryNotStartsWithSlash
	}
	pathComponents := strings.Split(file.Path, "/")

	// TODO: при условии, что в начале /
	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			if errors.Is(err, fileDomain.ErrNotFound) {
				return fileDomain.File{}, fileDomain.ErrSubdirectoryNotFound
			}
			return file, err
		}
	}

	_, err := uc.repo.GetFileByPath(ctx, file.Path)
	if err == nil {
		log.Println("Upload: the file path already exists")
		return fileDomain.File{}, fileDomain.ErrFileAlreadyExists
	} else if err != fileDomain.ErrNotFound {
		return fileDomain.File{}, err
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return file, sharederrors.ErrUserNotFoundInContext
	}

	file.Link = "/minio" + file.Path
	file.Bucket = user.Bucket
	file.Extension = getFileExtension(file.Filename)
	file.UserID = user.ID
	file.Status = fileDomain.Uploaded
	file.TimeCreated = time.Now()
	file.ID = uuid.New().String()
	file.IsDir = false
	file.IsShared = false

	file, err = uc.repo.UploadToStorage(ctx, fileReader, file)
	if err != nil {
		log.Println("UploadToStorage repo error:", err)
		return file, err
	}

	err = uc.repo.CreateFile(ctx, file)
	if err != nil {
		log.Println("CreateFile repo error:", err)
		return file, err
	}

	uc.notifyUsecase.Notify(notifier.Notify{
		Event:    eventChangeStatus,
		UserID:   user.ID,
		Path:     file.Path,
		Status:   string(file.Status),
		FileType: file.FileType,
	})

	err = uc.repo.PublishMessage(ctx, file)
	if err != nil {
		log.Println("PublishMessage repo error:", err)
		return file, err
	}
	return file, nil
}

func (uc *Usecase) GetFiles(ctx context.Context, options fileDomain.FileOptions) ([]fileDomain.File, error) {
	if options.Dir != "" && !strings.HasPrefix(options.Dir, "/") {
		log.Printf("Directory path [%s] does not start with /\n", options.Dir)
		return []fileDomain.File{}, fileDomain.ErrDirectoryNotStartsWithSlash
	}
	return uc.repo.GetFiles(ctx, options)
}

func (uc *Usecase) CreateDir(ctx context.Context, file fileDomain.File) (fileDomain.File, error) {
	if file.Path == "" {
		log.Printf("CreateDir: dir path is empty")
		return file, fileDomain.ErrDirectoryNotSpecified
	}
	if !strings.HasPrefix(file.Path, "/") {
		log.Printf("Directory path [%s] does not start with /\n", file.Path)
		return file, fileDomain.ErrDirectoryNotStartsWithSlash
	}
	_, err := uc.repo.GetFileByPath(ctx, file.Path)
	if err == nil {
		log.Println("Upload: the file path already exists")
		return file, fileDomain.ErrDirectoryAlreadyExists
	} else if err != fileDomain.ErrNotFound {
		log.Println("Upload: err", err)
		return file, err
	}

	pathComponents := strings.Split(file.Path, "/")

	// TODO: при условии, что в начале /
	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			if errors.Is(err, fileDomain.ErrNotFound) {
				return file, fileDomain.ErrSubdirectoryNotFound
			}
			return file, err
		}
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return file, sharederrors.ErrUserNotFoundInContext
	}
	file.Bucket = user.Email
	file.UserID = user.ID
	file.TimeCreated = time.Now()
	file.ID = uuid.New().String()
	file.IsDir = true
	file.IsShared = false
	err = uc.repo.CreateDir(ctx, file)
	if err != nil {
		log.Println("CreateDir repo error:", err)
		return file, err
	}
	return file, nil
}

func (uc *Usecase) Search(ctx context.Context, options fileDomain.FileOptions) ([]fileDomain.File, error) {
	if !strings.HasPrefix(options.Dir, "/") {
		log.Printf("Directory path [%s] does not start with /\n", options.Dir)
		return []fileDomain.File{}, fmt.Errorf("directory path [%s] does not start with /", options.Dir)
	}
	if options.IsSmartSearch {
		return uc.repo.SmartSearch(ctx, options)
	}
	return uc.repo.Search(ctx, options)
}

func (uc *Usecase) DeleteFiles(ctx context.Context, filePaths []string) error {
	for _, path := range filePaths {
		if !strings.HasPrefix(path, "/") {
			log.Printf("DeleteFiles: Directory path [%s] does not start with /\n", path)
			return fileDomain.ErrDirectoryNotStartsWithSlash
		}
	}
	var files []file.File
	for _, path := range filePaths {
		file, err := uc.repo.GetFileByPath(ctx, path)
		if err != nil {
			log.Println("GetFileByPath repo, path:", path, ", error:", err)
			return err
		}
		files = append(files, file)
	}

	stack := make([]file.File, 0)
	stack = append(stack, files...)

	for len(stack) > 0 {

		currentFile := stack[len(stack)-1]

		// fmt.Printf("%#v\n\n", stack)
		// fmt.Printf("%d\n\n", len(stack))
		// fmt.Printf("%#v\n\n", currentFile)

		stack = stack[:len(stack)-1]

		if currentFile.IsDir {
			retrievedFiles, err := uc.repo.GetFiles(ctx, fileDomain.FileOptions{Dir: currentFile.Path, FileType: fileDomain.AllTypes})
			if err != nil {
				if errors.Is(err, file.ErrNotFound) {
					continue
				}
				log.Println("Error retrieving files in directory:", currentFile.Path, ", error:", err)
				return err
			}
			stack = append(stack, retrievedFiles...)
		} else {
			err := uc.repo.RemoveFromStorage(ctx, currentFile)
			if err != nil {
				log.Println("Error removing from storage:", currentFile.Path, ", error:", err)
				return err
			}
			err = uc.repo.DeleteFile(ctx, currentFile)
			if err != nil {
				log.Println("Error deleting file:", currentFile.Path, ", error:", err)
				return err
			}
		}
	}
	return nil
}

func (uc *Usecase) CompleteProcessingFile(ctx context.Context, uuidFile string) error {
	file, err := uc.repo.GetFileByID(ctx, uuidFile)
	if err != nil {
		log.Println("GetFileByID repo error:", err)
		return err
	}

	file.Status = fileDomain.Processed

	err = uc.repo.Update(ctx, file)
	if err != nil {
		log.Println("Update repo error:", err)
		return err
	}

	uc.notifyUsecase.Notify(notifier.Notify{
		Event:    eventChangeStatus,
		UserID:   file.UserID,
		Path:     file.Path,
		Status:   string(file.Status),
		FileType: file.FileType,
	})
	return nil
}

func (uc *Usecase) DownloadFile(ctx context.Context, filePath string) (io.ReadCloser, error) {
	return uc.repo.DownloadFile(ctx, filePath)
}

func (uc *Usecase) GetSharingLink(ctx context.Context, reqShare file.RequestToShare) (string, error) {
	file, err := uc.repo.GetFileByPath(ctx, reqShare.Path)
	if err != nil {
		return "", err
	}
	if reqShare.ByEmails {
		for _, email := range reqShare.Emails {
			user, err := uc.userUsecase.GetUserByEmail(ctx, email)
			if err != nil {
				// TODO: если не найден email, нужно сообщать фронту о том, что пользователь не найден
				if !errors.Is(err, cleveruser.ErrUserNotFound) {
					return "", err
				}
			}
			err = uc.repo.AddUserToSharingDir(ctx, file, user.ID, reqShare.ShareAccess)
			if err != nil {
				return "", err
			}
		}
	}
	file.IsShared = true
	file.ShareLink = "/dirs/" + file.ID + "?sharing=true"
	file.ShareAccess = reqShare.ShareAccess
	uc.repo.Update(ctx, file)
	return file.ShareLink, nil
}

func (uc *Usecase) AddSheringGrant(ctx context.Context, fileID string) error {
	file, err := uc.repo.GetFileByID(ctx, fileID)
	if err != nil {
		log.Println("AddSheringGrant GetFileByID with error:", err)
		return err
	}
	if !file.IsShared {
		log.Println(fileDomain.ErrDirNotSharing.Error())
		return fileDomain.ErrDirNotSharing
	}
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}
	return uc.repo.AddUserToSharingDir(ctx, file, user.ID, file.ShareAccess)
}

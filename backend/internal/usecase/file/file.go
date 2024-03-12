package file

import (
	"context"
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
	"github.com/google/uuid"
)

var eventChangeStatus = "changeStatus"

type Usecase struct {
	repo          Repository
	notifyUsecase NotifyUsecase
}

func NewUsecase(repo Repository, notifyUsecase NotifyUsecase) *Usecase {
	return &Usecase{
		repo:          repo,
		notifyUsecase: notifyUsecase,
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
		return fileDomain.File{}, fmt.Errorf("directory path [%s] does not start with /", file.Path)
	}
	pathComponents := strings.Split(file.Path, "/")

	// TODO: при условии, что в начале /
	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			return file, err
		}
	}

	_, err := uc.repo.GetFileByPath(ctx, file.Path)
	if err == nil {
		log.Println("Upload: the file path already exists")
		return fileDomain.File{}, fmt.Errorf("the file path already exists")
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		return file, fmt.Errorf("user not found in context")
	}

	bucketName := strings.Split(user.Email, "@")[0]

	file.Extension = getFileExtension(file.Filename)
	file.UserID = user.ID
	file.Bucket = bucketName
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
		return []fileDomain.File{}, fmt.Errorf("directory path [%s] does not start with /", options.Dir)
	}
	return uc.repo.GetFiles(ctx, options)
}

func (uc *Usecase) CreateDir(ctx context.Context, file fileDomain.File) (fileDomain.File, error) {
	if file.Path == "" {
		log.Printf("CreateDir: dir path is empty")
		return fileDomain.File{}, fmt.Errorf("CreateDir: dir path is empty")
	}
	if !strings.HasPrefix(file.Path, "/") {
		log.Printf("Directory path [%s] does not start with /\n", file.Path)
		return fileDomain.File{}, fmt.Errorf("directory path [%s] does not start with /", file.Path)
	}
	_, err := uc.repo.GetFileByPath(ctx, file.Path)
	if err == nil {
		log.Println("CreateDir: the dir path already exists")
		return fileDomain.File{}, fmt.Errorf("the dir path already exists")
	}

	pathComponents := strings.Split(file.Path, "/")

	// TODO: при условии, что в начале /
	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			return file, err
		}
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		return file, fmt.Errorf("user not found in context")
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
			return fmt.Errorf("deleteFiles: Directory path [%s] does not start with /", path)
		}
	}
	var files []file.File
	for _, path := range filePaths {
		file, err := uc.repo.GetFileByPath(ctx, path)
		if err != nil {
			log.Println("GetFileByPath repo error:", err)
			return fmt.Errorf("file with path[%v] not exist: %w", path, err)
		}
		files = append(files, file)
	}

	for _, file := range files {
		if !file.IsDir {
			err := uc.repo.RemoveFromStorage(ctx, file)
			if err != nil {
				log.Println("RemoveFromStorage repo error:", err)
				return fmt.Errorf("error remove from storage path[%v]: %w", file.Path, err)
			}
		}
		err := uc.repo.DeleteFile(ctx, file)
		if err != nil {
			log.Println("DeleteFile repo error:", err)
			return fmt.Errorf("error delete from db path[%v]: %w", file.Path, err)
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

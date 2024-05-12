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

func (uc *Usecase) GetFileTypeByContentType(contentType string) fileDomain.FileType {
	fileType, exists := fileTypeMap[contentType]
	if !exists {
		log.Println("file type not found")
		return ""
	}
	return fileType
}

func (uc *Usecase) Upload(ctx context.Context, fileReader io.Reader, file fileDomain.File) (fileDomain.File, error) {
	if !strings.HasPrefix(file.Path, "/") {
		log.Printf("Directory path [%s] does not start with /\n", file.Path)
		return fileDomain.File{}, fileDomain.ErrDirectoryNotStartsWithSlash
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return fileDomain.File{}, sharederrors.ErrUserNotFoundInContext
	}

	pathComponents := strings.Split(file.Path, "/")

	var userID string
	if len(pathComponents)-1 > 1 {
		log.Printf("[%s] - [%s]", pathComponents[0], pathComponents[1])
		fileTmpShare, err := uc.repo.GetFileByPath(ctx, "/"+pathComponents[1], "")
		if err != nil {
			log.Println("GetFileByPath err:", err)
			return fileDomain.File{}, err
		}

		shredDir, err := uc.repo.GetSharedDir(ctx, fileTmpShare.ID, user.ID)
		if err != nil {
			if !errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("GetSharedDir err:", err)
				return fileDomain.File{}, err
			}
			if errors.Is(err, fileDomain.ErrNotFound) {
				userID = user.ID
			}
		} else {
			userID = ""
			// if !shredDir.Accepted || shredDir.ShareAccess != fileDomain.Writer {
			if shredDir.ShareAccess != fileDomain.Writer {
				log.Println("reader access, but try upload")
				return fileDomain.File{}, fmt.Errorf("reader access, but try upload")
			}
		}
	} else {
		userID = user.ID
	}

	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath, userID)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			if errors.Is(err, fileDomain.ErrNotFound) {
				return fileDomain.File{}, fileDomain.ErrSubdirectoryNotFound
			}
			return file, err
		}
	}

	_, err := uc.repo.GetFileByPath(ctx, file.Path, userID)
	if err == nil {
		log.Println("Upload: the file path already exists")
		return fileDomain.File{}, fileDomain.ErrFileAlreadyExists
	} else if err != fileDomain.ErrNotFound {
		return fileDomain.File{}, err
	}

	file.Link = "/minio/" + user.Bucket + file.Path
	file.Bucket = user.Bucket
	file.Extension = getFileExtension(file.Filename)
	file.UserID = user.ID
	file.Status = fileDomain.Uploaded
	file.TimeCreated = time.Now()
	file.ID = uuid.New().String()
	file.IsDir = false
	file.IsShared = false
	file.Email = user.Email

	switch file.Extension {
	case "doc", "docx", "odt", "ppt", "pptx", "odp", "txt", "md":
		var size int64
		fileReader, size, err = ConvertToPDF(ctx, fileReader, file)
		if err != nil {
			log.Println("ConvertToPDF repo error:", err)
			return fileDomain.File{}, err
		}
		file.Extension = "pdf"
		file.Size = fileDomain.SizeType(size)
		file.Path = replaceExtension(file.Path, "pdf")
		file.Filename = replaceExtension(file.Filename, "pdf")
		file.Link = replaceExtension(file.Link, "pdf")
		file.FileType = fileDomain.Text
	}

	file, err = uc.repo.UploadToStorage(ctx, fileReader, file)
	if err != nil {
		log.Println("UploadToStorage repo error:", err)
		return fileDomain.File{}, err
	}

	err = uc.repo.CreateFile(ctx, file)
	if err != nil {
		log.Println("CreateFile repo error:", err)
		return fileDomain.File{}, err
	}

	err = uc.repo.PublishMessage(ctx, file)
	if err != nil {
		log.Println("PublishMessage repo error:", err)
		return fileDomain.File{}, err
	}
	return file, nil
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

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return fileDomain.File{}, sharederrors.ErrUserNotFoundInContext
	}

	pathComponents := strings.Split(file.Path, "/")

	var userID string
	if len(pathComponents) > 2 {
		fileTmpShare, err := uc.repo.GetFileByPath(ctx, "/"+pathComponents[1], "")
		if err != nil {
			log.Println("GetFileByPath err:", err)
			return fileDomain.File{}, err
		}

		shredDir, err := uc.repo.GetSharedDir(ctx, fileTmpShare.ID, user.ID)
		if err != nil {
			if !errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("GetSharedDir err:", err)
				return fileDomain.File{}, err
			}
			if errors.Is(err, fileDomain.ErrNotFound) {
				userID = user.ID
			}
		} else {
			userID = ""
			// if !shredDir.Accepted || shredDir.ShareAccess != fileDomain.Writer {
			if shredDir.ShareAccess != fileDomain.Writer {
				log.Println("reader access, but try upload")
				return fileDomain.File{}, fmt.Errorf("reader access, but try upload")
			}
		}
	} else {
		userID = user.ID
	}

	// TODO: при условии, что в начале /
	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath, userID)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			if errors.Is(err, fileDomain.ErrNotFound) {
				return file, fileDomain.ErrSubdirectoryNotFound
			}
			return file, err
		}
	}

	_, err := uc.repo.GetFileByPath(ctx, file.Path, userID)
	if err == nil {
		log.Println("GetFileByPath: the file path already exists")
		return file, fileDomain.ErrDirectoryAlreadyExists
	} else if err != fileDomain.ErrNotFound {
		log.Println("GetFileByPath: err", err)
		return file, err
	}

	file.Filename = pathComponents[len(pathComponents)-1]
	file.Bucket = user.Bucket
	file.Email = user.Email
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

func (uc *Usecase) DeleteFiles(ctx context.Context, filePaths []string) error {
	for _, path := range filePaths {
		if !strings.HasPrefix(path, "/") {
			log.Printf("DeleteFiles: Directory path [%s] does not start with /\n", path)
			return fileDomain.ErrDirectoryNotStartsWithSlash
		}
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}

	var files []file.File
	for _, path := range filePaths {
		file, err := uc.repo.GetFileByPath(ctx, path, user.ID)
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
		stack = stack[:len(stack)-1]

		if currentFile.IsDir {
			dir, err := uc.repo.GetFileByPath(ctx, currentFile.Path, user.ID)
			if err != nil {
				return err
			}
			err = uc.repo.DeleteFile(ctx, dir)
			if err != nil {
				log.Println("Error deleting file:", currentFile.Path, ", error:", err)
				return err
			}

			options := fileDomain.FileOptions{
				Dir:           currentFile.Path,
				UserID:        user.ID,
				FirstNesting:  false,
				DirsRequired:  true,
				FilesRequired: true,
			}

			retrievedFiles, err := uc.repo.GetFiles(ctx, options)
			if err != nil {
				if errors.Is(err, file.ErrNotFound) {
					continue
				}
				log.Println("Error retrieving files in directory:", currentFile.Path, ", error:", err)
				return err
			}
			stack = append(stack, retrievedFiles...)
		} else {
			exists, err := uc.repo.BucketExists(ctx, currentFile.Bucket)
			if err != nil {
				log.Println("BucketExists error:", err)
				return err
			}
			if exists {
				err = uc.repo.RemoveFromStorage(ctx, currentFile)
				if err != nil {
					log.Println("Error removing from storage:", currentFile.Path, ", error:", err)
					return err
				}
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

	if string(file.Disk) != "" {
		err = uc.repo.RemoveFromStorage(ctx, file)
		if err != nil {
			log.Println("RemoveFromStorage err in CompleteProcessingFile:", err)
			return err
		}
	}

	uc.notifyUsecase.Notify(notifier.Notify{
		Event:  eventChangeStatus,
		File:   file,
		UserID: file.UserID,
	})
	return nil
}

func (uc *Usecase) DownloadFile(ctx context.Context, filePath string) (io.ReadCloser, error) {
	return uc.repo.DownloadFile(ctx, filePath)
}

func (uc *Usecase) GetFileByID(ctx context.Context, fileID string) (file.File, error) {
	return uc.repo.GetFileByID(ctx, fileID)
}

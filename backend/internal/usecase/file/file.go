package file

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
)

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

func (uc *Usecase) Upload(ctx context.Context, file file.File) error {
	file, err := uc.repo.UploadToStorage(ctx, file)
	if err != nil {
		return err
	}
	file.Status = "uploaded"
	file.TimeCreated = time.Now()
	file.ID = uuid.New().String()
	file.IsDir = false
	file.IsShared = false

	err = uc.repo.CreateFile(ctx, file)
	if err != nil {
		return err
	}
	uc.notifyUsecase.Notify(notifier.Notify{
		Event: "upload",
		// TODO: UserID: string(file.UserID),
		UserID: "1",
		S3URL:  file.S3URL,
	})
	err = uc.repo.PublishMessage(ctx, file)
	if err != nil {
		return err
	}
	// time.Sleep(time.Second * 2)
	// uc.notifyUsecase.Notify(notifier.Notify{
	// 	Event:   "wait processing",
	// 	UserID:  "1",
	// 	FileURL: file.URL,
	// })
	return err
}

func (uc *Usecase) GetFiles(ctx context.Context, options file.FileOptions) ([]file.File, error) {
	return uc.repo.GetFiles(ctx, options)
}

func (uc *Usecase) CreateDir(ctx context.Context, file file.File) (file.File, error) {
	file.TimeCreated = time.Now()
	file.ID = uuid.New().String()
	file.IsDir = true
	file.IsShared = false
	// TODO: нужно проверка, что все директории в цепочке (кроме последней), существуют
	err := uc.repo.CreateDir(ctx, file)
	if err != nil {
		return file, err
	}
	return file, nil
}

func (uc *Usecase) Search(ctx context.Context, options file.FileOptions) ([]file.File, error) {
	if options.IsSmartSearch {
		return uc.repo.SmartSearch(ctx, options)
	}
	return uc.repo.Search(ctx, options)
}

func (uc *Usecase) DeleteFiles(ctx context.Context, filePaths []string) error {
	var files []file.File
	for _, path := range filePaths {
		file, err := uc.repo.GetFileByPath(ctx, path)
		if err != nil {
			return fmt.Errorf("file with path[%v] not exist: %w", path, err)
		}
		files = append(files, file)
	}

	for _, file := range files {
		if !file.IsDir {
			err := uc.repo.RemoveFromStorage(ctx, file.Path)
			if err != nil {
				return fmt.Errorf("error remove from storage path[%v]: %w", file.Path, err)
			}
		}
		err := uc.repo.DeleteFile(ctx, file)
		if err != nil {
			return fmt.Errorf("error delete from db path[%v]: %w", file.Path, err)
		}
	}
	return nil
}

func (uc *Usecase) CompleteProcessingFile(ctx context.Context, uuidFile string) error {
	file, err := uc.repo.GetFileByID(ctx, uuidFile)
	if err != nil {
		return err
	}

	file.Status = "processed"

	err = uc.repo.Update(ctx, file)
	if err != nil {
		return err
	}

	uc.notifyUsecase.Notify(notifier.Notify{
		Event: "complete-processing",
		// TODO: UserID: string(file.UserID),
		UserID: "1",
		S3URL:  file.S3URL,
	})
	return nil
}

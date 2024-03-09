package file

import (
	"context"

	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
)

type Repository interface {
	CreateFile(ctx context.Context, file file.File) error
	GetFiles(ctx context.Context, options file.FileOptions) ([]file.File, error)
	PublishMessage(ctx context.Context, file file.File) error
	GetFileByID(ctx context.Context, uuidFile string) (file.File, error)
	GetFileByPath(ctx context.Context, path string) (file.File, error)
	SmartSearch(ctx context.Context, options file.FileOptions) ([]file.File, error)
	Search(ctx context.Context, options file.FileOptions) ([]file.File, error)
	CreateDir(ctx context.Context, file file.File) error
	DeleteFile(ctx context.Context, file file.File) error
	Update(ctx context.Context, file file.File) error
	UploadToStorage(ctx context.Context, file file.File) (file.File, error)
	RemoveFromStorage(ctx context.Context, path string) error
}

type NotifyUsecase interface {
	Notify(notify notifier.Notify)
}

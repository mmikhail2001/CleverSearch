package file

import (
	"context"
	"io"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/notifier"
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
	UploadToStorage(ctx context.Context, fileReader io.Reader, file file.File) (file.File, error)
	RemoveFromStorage(ctx context.Context, file file.File) error
}

type NotifyUsecase interface {
	Notify(notify notifier.Notify)
}

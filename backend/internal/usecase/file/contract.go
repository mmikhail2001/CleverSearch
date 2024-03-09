package file

import (
	"context"

	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
)

type Repository interface {
	Upload(ctx context.Context, file file.File) (file.File, error)
	CreateFile(ctx context.Context, file file.File) error
	GetFiles(ctx context.Context, options file.FileOptions) ([]file.File, error)
	PublishMessage(ctx context.Context, file file.File) error
	GetFileByID(ctx context.Context, uuidFile string) (file.File, error)
	Update(ctx context.Context, file file.File) error
	SmartSearch(ctx context.Context, options file.FileOptions) ([]file.File, error)
	Search(ctx context.Context, options file.FileOptions) ([]file.File, error)
}

type NotifyUsecase interface {
	Notify(notify notifier.Notify)
}

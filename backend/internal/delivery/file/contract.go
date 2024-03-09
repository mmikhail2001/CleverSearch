package file

import (
	"context"

	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
)

type Usecase interface {
	Upload(ctx context.Context, file file.File) error
	GetFiles(ctx context.Context, options file.FileOptions) ([]file.File, error)
	Search(ctx context.Context, options file.FileOptions) ([]file.File, error)
	CompleteProcessingFile(ctx context.Context, uuid string) error
}

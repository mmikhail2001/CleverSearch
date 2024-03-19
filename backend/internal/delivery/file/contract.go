package file

import (
	"context"
	"io"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

type Usecase interface {
	Upload(ctx context.Context, fileReader io.Reader, file file.File) (file.File, error)
	GetFiles(ctx context.Context, options file.FileOptions) ([]file.File, error)
	Search(ctx context.Context, options file.FileOptions) ([]file.File, error)
	CompleteProcessingFile(ctx context.Context, uuid string) error
	CreateDir(ctx context.Context, file file.File) (file.File, error)
	DeleteFiles(ctx context.Context, filePaths []string) error
	DownloadFile(ctx context.Context, filePath string) (io.ReadCloser, error)
	GetSharingLink(ctx context.Context, reqShare file.RequestToShare) (string, error)
}

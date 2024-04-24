package cloud

import (
	"context"
	"io"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"golang.org/x/oauth2"
)

type FileUsecase interface {
	GetFileTypeByContentType(contentType string) file.FileType
	Upload(ctx context.Context, fileReader io.Reader, file fileDomain.File) (fileDomain.File, error)
	GetFiles(ctx context.Context, options fileDomain.FileOptions) ([]fileDomain.File, error)
	CreateDir(ctx context.Context, file fileDomain.File) (fileDomain.File, error)
	DeleteFiles(ctx context.Context, filePaths []string) error
}

type FileRepository interface {
	CreateFile(ctx context.Context, file file.File) error
	UploadToStorage(ctx context.Context, fileReader io.Reader, file file.File) (file.File, error)
	PublishMessage(ctx context.Context, file file.File) error
	GetFileByCloudID(ctx context.Context, cloudID string) (file.File, error)
	GetFileByPath(ctx context.Context, path string, userID string) (file.File, error)
	GetSharedDir(ctx context.Context, fileID string, userID string) (file.SharedDir, error)
}

type UserRepository interface {
	AddTokenToUser(ctx context.Context, token *oauth2.Token, cloudEmail string, disk file.DiskType, user cleveruser.User) error
	CheckCloudExists(ctx context.Context, cloudEmail string, user cleveruser.User) (bool, error)
	UpdateUser(ctx context.Context, user cleveruser.User) error
}

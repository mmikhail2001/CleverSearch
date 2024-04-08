package cloud

import (
	"context"
	"io"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"golang.org/x/oauth2"
)

type FileUsecase interface {
	GetFileTypeByContentType(contentType string) file.FileType
}

type FileRepository interface {
	CreateFile(ctx context.Context, file file.File) error
	UploadToStorage(ctx context.Context, fileReader io.Reader, file file.File) (file.File, error)
}

type UserRepository interface {
	AddTokenToUser(ctx context.Context, token *oauth2.Token, cloudEmail string, disk file.DiskType, user cleveruser.User) error
	CheckCloudExists(ctx context.Context, cloudEmail string, user cleveruser.User) (bool, error)
	UpdateUser(ctx context.Context, user cleveruser.User) error
}

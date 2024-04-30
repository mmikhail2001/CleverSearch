package file

import (
	"context"
	"io"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/notifier"
)

type Repository interface {
	CreateFile(ctx context.Context, file file.File) error
	GetFiles(ctx context.Context, options file.FileOptions) ([]file.File, error)
	PublishMessage(ctx context.Context, file file.File) error
	GetFileByID(ctx context.Context, uuidFile string) (file.File, error)
	GetFileByPath(ctx context.Context, path string, userID string) (file.File, error)
	GetSharedDir(ctx context.Context, fileID string, userID string) (file.SharedDir, error)
	GetSharedDirs(ctx context.Context, path string, userID string, accepted bool) ([]file.File, error)
	SmartSearch(ctx context.Context, options file.FileOptions) ([]file.File, error)
	Search(ctx context.Context, options file.FileOptions) ([]file.File, error)
	CreateDir(ctx context.Context, file file.File) error
	DeleteFile(ctx context.Context, file file.File) error
	Update(ctx context.Context, file file.File) error
	UploadToStorage(ctx context.Context, fileReader io.Reader, file file.File) (file.File, error)
	RemoveFromStorage(ctx context.Context, file file.File) error
	DownloadFile(ctx context.Context, filePath string) (io.ReadCloser, error)
	// AddUserToSharingDir(ctx context.Context, file file.File, userID string, accessType file.AccessType) error
	IsBucketEmpty(ctx context.Context, bucketName string) (bool, error)
	InsertSharedDir(ctx context.Context, sharedDir file.SharedDir) error
	UpdateSharedDir(ctx context.Context, sharedDir file.SharedDir) (file.SharedDir, error)
	GetAllFiles() ([]file.File, error)

	GetFavs(ctx context.Context, userID string) ([]file.File, error)
	AddFav(ctx context.Context, userID string, fileID string) error
	DeleteFav(ctx context.Context, userID string, fileID string) error

	// v2
	GetFilesV2(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
	SmartSearchV2(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
}

type UserUsecase interface {
	GetUserByEmail(ctx context.Context, email string) (cleveruser.User, error)
}

type NotifyUsecase interface {
	Notify(notify notifier.Notify)
}

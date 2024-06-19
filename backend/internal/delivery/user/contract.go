package user

import (
	"context"
	"io"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
)

type Usecase interface {
	Register(ctx context.Context, user cleveruser.User) (cleveruser.User, error)
	Login(ctx context.Context, authUser cleveruser.User) (string, error)
	Logout(ctx context.Context, sessionID string) error
	AddAvatar(ctx context.Context, fileReader io.Reader, contentType string) error
	GetAvatar(ctx context.Context, userEmail string) (string, string, error)
	CheckEmails(ctx context.Context, emails []string) ([]cleveruser.ReportEmail, error)
}

type CloudUsecase interface {
	UpdateAllTokens(ctx context.Context, user *cleveruser.User) error
}

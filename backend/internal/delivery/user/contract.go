package user

import (
	"context"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
)

type Usecase interface {
	Register(ctx context.Context, user cleveruser.User) (cleveruser.User, error)
	Login(ctx context.Context, authUser cleveruser.User) (string, error)
	Logout(ctx context.Context, sessionID string) error
}

type CloudUsecase interface {
	UpdateAllTokens(ctx context.Context, user *cleveruser.User) error
}

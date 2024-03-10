package user

import (
	"context"

	"github.com/mmikhail2001/test-clever-search/internal/domain/cleveruser"
)

type Usecase interface {
	Register(ctx context.Context, user cleveruser.User) (cleveruser.User, error)
	Login(ctx context.Context, authUser cleveruser.User) (string, error)
	Logout(ctx context.Context, sessionID string) error
}

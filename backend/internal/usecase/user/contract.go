package user

import (
	"context"

	"github.com/mmikhail2001/test-clever-search/internal/domain/cleveruser"
)

type Repository interface {
	CreateUser(ctx context.Context, user cleveruser.User) (cleveruser.User, error)
	GetUserByEmail(ctx context.Context, email string) (cleveruser.User, error)
}

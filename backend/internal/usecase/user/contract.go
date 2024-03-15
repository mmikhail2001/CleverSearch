package user

import (
	"context"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
)

type Repository interface {
	CreateUser(ctx context.Context, user cleveruser.User) (cleveruser.User, error)
	GetUserByEmail(ctx context.Context, email string) (cleveruser.User, error)
}

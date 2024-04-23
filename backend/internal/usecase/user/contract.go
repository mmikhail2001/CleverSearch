package user

import (
	"context"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
)

type Repository interface {
	CreateUser(ctx context.Context, user cleveruser.User) (cleveruser.User, error)
	GetUserByEmail(ctx context.Context, email string) (cleveruser.User, error)
	GetUserByID(ctx context.Context, userID string) (cleveruser.User, error)
	AddAvatar(ctx context.Context, userID string, avatarBase64 string, contentType string) error
	GetAvatar(ctx context.Context, userEmail string) (string, string, error)
}

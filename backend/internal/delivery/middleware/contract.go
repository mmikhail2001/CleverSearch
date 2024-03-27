package middleware

import (
	"context"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
)

type UserUsecase interface {
	GetUserBySession(ctx context.Context, session string) (cleveruser.User, error)
	GetUserByID(ctx context.Context, userID string) (cleveruser.User, error)
}

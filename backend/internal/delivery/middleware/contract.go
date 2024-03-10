package middleware

import (
	"context"

	"github.com/mmikhail2001/test-clever-search/internal/domain/cleveruser"
)

type UserUsecase interface {
	GetUserBySession(ctx context.Context, session string) (cleveruser.User, error)
}

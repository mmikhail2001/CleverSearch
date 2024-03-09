package middleware

import "github.com/mmikhail2001/test-clever-search/internal/domain/user"

type UserHandler interface {
	GetUserSessions() map[string]user.User
}

package cleveruser

import "errors"

var (
	ErrWrongCredentials       = errors.New("wrong credentials")
	ErrNotValidEmail          = errors.New("email is not valid")
	ErrNotValidPassword       = errors.New("password is not valid")
	ErrUserNotFound           = errors.New("user not found")
	ErrUserAlreadyExists      = errors.New("user already exists")
	ErrSessionNotFound        = errors.New("session not found")
	ErrCookieNotFound         = errors.New("cookie not found")
	ErrAuthenticationRequired = errors.New("authentication required")
)

type User struct {
	ID       string
	Email    string
	Password string
	Bucket   string
}

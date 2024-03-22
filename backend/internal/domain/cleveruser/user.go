package cleveruser

import "errors"

var (
	ErrWrongCredentials          = errors.New("wrong credentials")
	StatusWrongCredentials       = 20
	ErrNotValidEmail             = errors.New("email is not valid")
	StatusNotValidEmail          = 21
	ErrNotValidPassword          = errors.New("password is not valid")
	StatusNotValidPassword       = 22
	ErrUserNotFound              = errors.New("user not found")
	StatusUserNotFound           = 23
	ErrUserAlreadyExists         = errors.New("user already exists")
	StatusUserAlreadyExists      = 24
	ErrSessionNotFound           = errors.New("session not found")
	StatusSessionNotFound        = 25
	ErrCookieNotFound            = errors.New("cookie not found")
	StatusCookieNotFound         = 26
	ErrAuthenticationRequired    = errors.New("authentication required")
	StatusAuthenticationRequired = 27
)

type User struct {
	ID       string
	Email    string
	Password string
	Bucket   string
}

package sharederrors

import "errors"

var (
	ErrUserNotFoundInContext = errors.New("user not foud in context")
)

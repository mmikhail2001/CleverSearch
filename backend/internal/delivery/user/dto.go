package user

type UserDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type EmailDTO struct {
	Email string `json:"email"`
}

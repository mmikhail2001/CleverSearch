package user

type UserDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ProfileDTO struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

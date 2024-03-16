package user

type UserDTO struct {
	ID       string `bson:"_id"`
	Email    string `bson:"email"`
	Password string `bson:"password"`
	Bucket   string `bson:"bucket"`
}

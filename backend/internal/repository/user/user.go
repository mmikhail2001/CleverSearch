package user

import (
	"context"

	"github.com/mmikhail2001/test-clever-search/internal/domain/cleveruser"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	mongo *mongo.Database
}

func NewRepository(mongo *mongo.Database) *Repository {
	return &Repository{
		mongo: mongo,
	}
}

func (r *Repository) CreateUser(ctx context.Context, user cleveruser.User) (cleveruser.User, error) {
	collection := r.mongo.Collection("users")

	userDTO := UserDTO{
		ID:       user.ID,
		Email:    user.Email,
		Password: user.Password,
	}

	_, err := collection.InsertOne(ctx, userDTO)
	if err != nil {
		return user, err
	}

	return user, nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (cleveruser.User, error) {
	collection := r.mongo.Collection("users")

	var user cleveruser.User
	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return user, err
	}

	return user, nil
}

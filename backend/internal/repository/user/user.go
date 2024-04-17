package user

import (
	"context"
	"errors"
	"log"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/dranikpg/dto-mapper"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
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

	var userDTO UserDTO
	if err := dto.Map(&userDTO, &user); err != nil {
		log.Println("CreateUser: Error mapping user to DTO")
		return user, err
	}

	_, err := collection.InsertOne(ctx, userDTO)
	if err != nil {
		log.Println("CreateUser: InsertOne error")
		return user, err
	}

	return user, nil
}

func (r *Repository) UpdateUser(ctx context.Context, user cleveruser.User) error {
	collection := r.mongo.Collection("users")

	var userDTO UserDTO
	if err := dto.Map(&userDTO, &user); err != nil {
		log.Println("UpdateUser: Error mapping user to DTO")
		return err
	}

	filter := bson.M{"_id": user.ID}
	update := bson.M{"$set": userDTO}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("UpdateUser: UpdateOne error")
		return err
	}

	return nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (cleveruser.User, error) {
	collection := r.mongo.Collection("users")

	var userDTO UserDTO
	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&userDTO)
	if err != nil {
		log.Println("GetUserByEmail: FindOne error")
		if errors.Is(err, mongo.ErrNoDocuments) {
			return cleveruser.User{}, cleveruser.ErrUserNotFound
		}
		return cleveruser.User{}, err
	}

	var user cleveruser.User
	if err := dto.Map(&user, &userDTO); err != nil {
		log.Println("GetUserByEmail: Error mapping DTO to user")
		return cleveruser.User{}, err
	}

	return user, nil
}

func (r *Repository) GetUserByID(ctx context.Context, userID string) (cleveruser.User, error) {
	collection := r.mongo.Collection("users")

	var userDTO UserDTO
	err := collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&userDTO)
	if err != nil {
		log.Println("GetUserByID: FindOne error")
		if errors.Is(err, mongo.ErrNoDocuments) {
			return cleveruser.User{}, cleveruser.ErrUserNotFound
		}
		return cleveruser.User{}, err
	}

	var user cleveruser.User
	if err := dto.Map(&user, &userDTO); err != nil {
		log.Println("GetUserByID: Error mapping DTO to user")
		return cleveruser.User{}, err
	}

	return user, nil
}

func (r *Repository) CheckCloudExists(ctx context.Context, cloudEmail string, user cleveruser.User) (bool, error) {
	collection := r.mongo.Collection("users")

	filter := bson.M{
		"_id": user.ID,
		"connected_clouds": bson.M{
			"$elemMatch": bson.M{"cloud_email": cloudEmail},
		},
	}

	count, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		log.Println("checkCloudEmailExists: CountDocuments error", err)
		return false, err
	}

	return count > 0, nil
}

func (r *Repository) AddTokenToUser(ctx context.Context, token *oauth2.Token, cloudEmail string, disk file.DiskType, user cleveruser.User) error {
	tokenDTO := TokenDTO{
		AccessToken:  token.AccessToken,
		TokenType:    token.TokenType,
		RefreshToken: token.RefreshToken,
		Expiry:       token.Expiry,
	}

	connectedCloud := UserCloud{
		Cloud:      disk,
		CloudEmail: cloudEmail,
		Token:      tokenDTO,
	}

	filter := bson.M{"_id": user.ID}
	update := bson.M{
		"$push": bson.M{"connected_clouds": connectedCloud},
	}

	_, err := r.mongo.Collection("users").UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("AddTokenToUser: UpdateOne error", err)
		return err
	}
	return nil
}

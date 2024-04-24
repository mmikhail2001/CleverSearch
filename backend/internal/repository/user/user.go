package user

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"os"

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

	randomAvatarNum := rand.Intn(6) + 1

	filename := fmt.Sprintf("static/%d.png", randomAvatarNum)

	file, err := os.Open(filename)
	if err != nil {
		return cleveruser.User{}, err
	}
	defer file.Close()

	avatarBytes, err := io.ReadAll(file)
	if err != nil {
		return cleveruser.User{}, err
	}

	avatarBase64 := base64.StdEncoding.EncodeToString(avatarBytes)

	var userDTO UserDTO
	if err := dto.Map(&userDTO, &user); err != nil {
		log.Println("CreateUser: Error mapping user to DTO")
		return user, err
	}

	userDTO.Avatar = avatarBase64
	userDTO.ContentTypeAvatar = "image/png"

	_, err = collection.InsertOne(ctx, userDTO)
	if err != nil {
		log.Println("CreateUser: InsertOne error")
		return user, err
	}

	return user, nil
}

// TODO: обновление только токенов
func (r *Repository) UpdateUser(ctx context.Context, user cleveruser.User) error {
	collection := r.mongo.Collection("users")

	filter := bson.M{"_id": user.ID}
	var userDTO UserDTO
	err := collection.FindOne(ctx, filter).Decode(&userDTO)
	if err != nil {
		log.Println("UpdateUser: Error fetching user from database")
		return err
	}

	userDTO.ConnectedClouds = make([]UserCloud, len(user.ConnectedClouds))
	for i, cloud := range user.ConnectedClouds {
		userDTO.ConnectedClouds[i] = UserCloud{
			Cloud:      cloud.Cloud,
			CloudEmail: cloud.CloudEmail,
			Token: TokenDTO{
				AccessToken:  cloud.Token.AccessToken,
				TokenType:    cloud.Token.TokenType,
				RefreshToken: cloud.Token.RefreshToken,
				Expiry:       cloud.Token.Expiry,
			},
		}
	}

	update := bson.M{"$set": userDTO}
	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("UpdateUser: UpdateOne error")
		return err
	}

	return nil
}

// func (r *Repository) UpdateUser(ctx context.Context, user cleveruser.User) error {
// 	collection := r.mongo.Collection("users")

// 	var userDTO UserDTO
// 	if err := dto.Map(&userDTO, &user); err != nil {
// 		log.Println("UpdateUser: Error mapping user to DTO")
// 		return err
// 	}

// 	filter := bson.M{"_id": user.ID}
// 	update := bson.M{"$set": userDTO}

// 	_, err := collection.UpdateOne(ctx, filter, update)
// 	if err != nil {
// 		log.Println("UpdateUser: UpdateOne error")
// 		return err
// 	}

// 	return nil
// }

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

func (r *Repository) AddAvatar(ctx context.Context, userID string, avatarBase64 string, contentType string) error {
	filter := bson.M{"_id": userID}
	update := bson.M{
		"$set": bson.M{
			"avatar":       avatarBase64,
			"content_type": contentType,
		},
	}
	_, err := r.mongo.Collection("users").UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("AddAvatar: UpdateOne error")
		return err
	}

	return nil
}

func (r *Repository) GetAvatar(ctx context.Context, userEmail string) (string, string, error) {
	filter := bson.M{"email": userEmail}
	result := r.mongo.Collection("users").FindOne(ctx, filter)
	if result.Err() != nil {
		log.Println("GetAvatar: FindOne error")
		return "", "", result.Err()
	}

	var user UserDTO
	if err := result.Decode(&user); err != nil {
		log.Println("GetAvatar: Decode error")
		return "", "", err
	}

	return user.Avatar, user.ContentTypeAvatar, nil
}

package user

import (
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

type UserDTO struct {
	ID              string      `bson:"_id"`
	Email           string      `bson:"email"`
	Password        string      `bson:"password"`
	Bucket          string      `bson:"bucket"`
	ConnectedClouds []UserCloud `bson:"connected_clouds"`
}

type UserCloud struct {
	Cloud      file.DiskType `bson:"cloud"`
	CloudEmail string        `bson:"cloud_email"`
	Token      TokenDTO      `bson:"token"`
}

type TokenDTO struct {
	AccessToken  string    `bson:"access_token"`
	TokenType    string    `bson:"token_type"`
	RefreshToken string    `bson:"refresh_token"`
	Expiry       time.Time `bson:"expiry"`
}

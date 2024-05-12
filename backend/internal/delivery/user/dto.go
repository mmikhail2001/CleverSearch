package user

import "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"

type UserDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ProfileDTO struct {
	ID              string           `json:"id"`
	Email           string           `json:"email"`
	ConnectedClouds []ConnectedCloud `json:"connected_clouds"`
}

type ConnectedCloud struct {
	CloudEmail  string        `json:"cloud_email"`
	Disk        file.DiskType `json:"disk"`
	AccessToken string        `json:"access_token"`
}

type EmailsDTO struct {
	Emails []string `json:"emails"`
}

type ReportEmailDTO struct {
	Email  string `json:"email"`
	Exists bool   `json:"exists"`
}

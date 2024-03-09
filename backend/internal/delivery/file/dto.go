package file

import (
	"time"
)

type AccessType string

type FileDTO struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	UserID   string `json:"user_id"`
	Path     string `json:"path"`
	IsShared bool   `json:"is_shared"`
	Sharing  struct {
		AuthorID string `json:"author_id"`
		Access   string `json:"access"`
		IsOwner  bool   `json:"is_owner"`
	} `json:"sharing"`
	DateCreated time.Time `json:"date_created"`
	IsDir       bool      `json:"is_dir"`
	Size        string    `json:"size"`
	ContentType string    `json:"content_type"`
	Extension   string    `json:"extension"`
	Status      string    `json:"status"`
	S3URL       string    `json:"url_s3"`
}

package file

import (
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

type fileDTO struct {
	ID            string          `bson:"_id"`
	Filename      string          `bson:"filename"`
	TimeCreated   time.Time       `bson:"time_created"`
	UserID        string          `bson:"user_id"`
	Path          string          `bson:"path"`
	Bucket        string          `bson:"bucket"`
	IsDir         bool            `bson:"is_dir"`
	FileType      file.FileType   `bson:"file_type"`
	Size          int64           `bson:"size"`
	ContentType   string          `bson:"content_type"`
	Extension     string          `bson:"extension"`
	Status        file.StatusType `bson:"status"`
	IsShared      bool            `bson:"is_shared"`
	ShareAccess   file.AccessType `bson:"share_access"`
	ShareLink     string          `bson:"share_link"`
	ShareAuthorID string          `bson:"share_author_id"`
	// Disk
}

type fileForQueueDTO struct {
	ID          string `json:"id"`
	Path        string `json:"path"`
	Bucket      string `json:"bucket"`
	ContentType string `json:"contentType"`
}

// { "status": TODO, "body": { "ids": [ file_id1, file_id2, file_id3, ... ] } }

type searchResponseDTO struct {
	Status int         `json:"status"`
	Body   interface{} `json:"body"`
}

type Ids struct {
	Ids []string `json:"ids"`
}

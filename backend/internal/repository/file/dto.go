package file

import (
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

type fileDTO struct {
	ID          string          `bson:"_id"`
	Filename    string          `bson:"filename"`
	TimeCreated time.Time       `bson:"time_created"`
	UserID      string          `bson:"user_id"`
	Path        string          `bson:"path"`
	Bucket      string          `bson:"bucket"`
	IsDir       bool            `bson:"is_dir"`
	FileType    file.FileType   `bson:"file_type"`
	Size        int64           `bson:"size"`
	ContentType string          `bson:"content_type"`
	Extension   string          `bson:"extension"`
	Status      file.StatusType `bson:"status"`
	IsShared    bool            `bson:"is_shared"`
	ShareAccess file.AccessType `bson:"share_access"`
	ShareLink   string          `bson:"share_link"`
	Link        string          `bson:"link"`
	MLData      interface{}     `bson:"ml_data"`
	// Disk
}

type fileForQueueDTO struct {
	ID       string `json:"id"`
	Path     string `json:"path"`
	Bucket   string `json:"bucket"`
	FileType string `json:"file_type"`
}

type searchResponseDTO struct {
	FilesID []searchItemDTO `json:"files"`
}

type searchItemDTO struct {
	Index  int    `json:"index"`
	FileID string `json:"file_uuid"`
}

type sharedDirDTO struct {
	ID          string          `bson:"_id"`
	FileID      string          `bson:"file_id"`
	UserID      string          `bson:"user_id"`
	ShareAccess file.AccessType `bson:"share_access"`
	Path        string          `bson:"path"`
}

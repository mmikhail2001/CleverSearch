package notifier

import (
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

type NotifyDTO struct {
	Event string  `json:"event"`
	File  FileDTO `json:"file"`
}

type FileDTO struct {
	ID          string          `json:"id"`
	Filename    string          `json:"filename"`
	TimeCreated time.Time       `json:"time_created"`
	UserID      string          `json:"user_id"`
	Email       string          `json:"email"`
	Path        string          `json:"path"`
	Bucket      string          `json:"bucket"`
	IsDir       bool            `json:"is_dir"`
	FileType    file.FileType   `json:"file_type"`
	Size        string          `json:"size"`
	ContentType string          `json:"content_type"`
	Extension   string          `json:"extension"`
	Status      file.StatusType `json:"status"`
	IsShared    bool            `json:"is_shared"`
	ShareAccess file.AccessType `json:"share_access"`
	ShareLink   string          `json:"share_link"`
	Link        string          `json:"link"`
	CloudID     string          `json:"cloud_id"`
	CloudEmail  string          `json:"cloud_email"`
	Disk        file.DiskType   `json:"disk"`
	PageNumber  int             `json:"page_number"`
	Timestart   int             `json:"timestart"`
	Duration    time.Duration   `json:"duration"`
}

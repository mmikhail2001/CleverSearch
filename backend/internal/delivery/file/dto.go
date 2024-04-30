package file

import (
	"encoding/json"
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

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
	IsFav       bool            `json:"is_fav"`
}

func (fd *FileDTO) MarshalJSON() ([]byte, error) {
	type Alias FileDTO
	now := time.Now()
	formattedDate := ""

	if fd.TimeCreated.Format("2006-01-02") == now.Format("2006-01-02") {
		formattedDate = "today at" + fd.TimeCreated.Format("15:04")
	} else {
		formattedDate = fd.TimeCreated.Format("02 January 2006")
	}

	return json.Marshal(&struct {
		*Alias
		TimeCreated string `json:"time_created"`
	}{
		Alias:       (*Alias)(fd),
		TimeCreated: formattedDate,
	})
}

type FileForMLDTO struct {
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
	IsFav       bool            `json:"is_fav"`
	MLData      interface{}     `json:"ml_data"`
}

type DeleteFilesDTO struct {
	Files []string `json:"files"`
}

type RequestToShareDTO struct {
	Path        string   `json:"dir"`
	ShareAccess string   `json:"access_type"`
	ByEmails    bool     `json:"by_emails"`
	Emails      []string `json:"emails"`
}

type ResponseShareLinkDTO struct {
	ShareLink string `json:"share_link"`
}

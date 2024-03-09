package file

import "time"

type fileDTO struct {
	ID          string    `bson:"_id,omitempty"`
	S3URL       string    `bson:"url_s3"`
	Filename    string    `bson:"filename"`
	UserID      string    `bson:"user_id"`
	Path        string    `bson:"path"`
	Size        int64     `bson:"size"`
	TimeCreated time.Time `bson:"time_created"`
	ContentType string    `bson:"content_type"`
	Extension   string    `bson:"extension"`
	Status      string    `bson:"status"`
	IsDir       bool      `bson:"is_dir"`
	IsShared    bool      `bson:"is_shared"`
}

type fileForQueueDTO struct {
	ID          string `json:"id"`
	S3URL       string `json:"url"`
	ContentType string `json:"contentType"`
}

type SearchResponseDTO struct {
	Status int `json:"status"`
	Body   struct {
		Ids []string `json:"ids"`
	} `json:"body"`
}

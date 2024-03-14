package file

import "time"

type fileDTO struct {
	ID          string    `bson:"_id"`
	Filename    string    `bson:"filename"`
	UserID      string    `bson:"user_id"`
	Path        string    `bson:"path"`
	Bucket      string    `bson:"bucket"`
	Size        int64     `bson:"size"`
	TimeCreated time.Time `bson:"time_created"`
	ContentType string    `bson:"content_type"`
	Extension   string    `bson:"extension"`
	Status      string    `bson:"status"`
	IsDir       bool      `bson:"is_dir"`
	IsShared    bool      `bson:"is_shared"`
	Link        string    `bson:"link"`
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

package file

import (
	"mime/multipart"
	"time"
)

type AccessType string

const (
	Reader AccessType = "reader"
	Writer AccessType = "writer"
)

type StatusType string

const (
	Uploaded  StatusType = "uploaded"
	Processed StatusType = "processed"
)

type File struct {
	ID          string
	Filename    string
	TimeCreated time.Time
	UserID      string
	Path        string
	Bucket      string
	IsDir       bool
	IsShared    bool
	Link        string
	Sharing     struct {
		Access AccessType
		Link   string
	}
	Size        int64
	File        multipart.File
	ContentType string
	Extension   string
	Status      StatusType
	// Disk
}

type FileType string

const (
	AllTypes FileType = "all"
	Image    FileType = "img"
	Video    FileType = "video"
	Text     FileType = "text"
	Audio    FileType = "audio"
)

type DiskType string

const (
	AllStorages  FileType = "all"
	Own          FileType = "own"
	GoogleDrive  FileType = "google_drive"
	YandexDisc   FileType = "yandex_disc"
	LocalStorage FileType = "local_storage"
)

type FileOptions struct {
	FileType      FileType
	OnlyDirs      bool
	Dir           string
	Shared        bool
	Disk          DiskType
	Limit         int
	Offset        int
	Query         string
	IsSmartSearch bool
}

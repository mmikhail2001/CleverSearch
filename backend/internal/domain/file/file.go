package file

import (
	"errors"
	"time"
)

var (
	ErrFileExceedsMaxSize          = errors.New("file exceeds maximum size")
	ErrFileAlreadyExists           = errors.New("file already exists")
	ErrDirectoryAlreadyExists      = errors.New("dir already exists")
	ErrDirectoryNotStartsWithSlash = errors.New("directory does not start with slash")
	ErrContentTypeNotSet           = errors.New("content-type not set for file upload")
	ErrSearchWithEmptyQuery        = errors.New("search with empty query")
	ErrNotFound                    = errors.New("not found")
	ErrSubdirectoryNotFound        = errors.New("subdirectory does not exist")
	ErrDirectoryNotSpecified       = errors.New("directory not specified")
	ErrDirNotSharing               = errors.New("requested dir is not sharing")
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
	ID            string
	Filename      string
	TimeCreated   time.Time
	UserID        string
	Path          string
	Bucket        string
	IsDir         bool
	FileType      FileType
	Size          int64
	ContentType   string
	Extension     string
	Status        StatusType
	IsShared      bool
	ShareAccess   AccessType
	ShareLink     string
	ShareAuthorID string
	Link          string
	// Disk
}

type FileType string

const (
	AllTypes FileType = "all"
	Image    FileType = "img"
	Video    FileType = "video"
	Text     FileType = "text"
	Audio    FileType = "audio"
	Unknown  FileType = "unknown"
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
	FileType FileType
	OnlyDirs bool
	// TODO: заменить на path
	Dir    string
	UserID string
	// для поиска в коллекции shared_dirs
	Shared        bool
	Disk          DiskType
	Limit         int
	Offset        int
	Query         string
	Status        StatusType
	IsSmartSearch bool
}

type RequestToShare struct {
	Path        string
	ShareAccess AccessType
	ByEmails    bool
	Emails      []string
}

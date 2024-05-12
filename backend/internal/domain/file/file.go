package file

import (
	"errors"
	"time"
)

// TODO: наверное, можно было создать структуру, которая реализует интерфейс error и имеет метод GetStatusNumber
var (
	ErrFileExceedsMaxSize             = errors.New("file exceeds maximum size")
	StatusFileExceedsMaxSize          = 1
	ErrFileAlreadyExists              = errors.New("file already exists")
	StatusFileAlreadyExists           = 2
	ErrDirectoryAlreadyExists         = errors.New("dir already exists")
	StatusDirectoryAlreadyExists      = 3
	ErrDirectoryNotStartsWithSlash    = errors.New("directory does not start with slash")
	StatusDirectoryNotStartsWithSlash = 4
	ErrContentTypeNotSet              = errors.New("content-type not set for file upload")
	StatusContentTypeNotSet           = 5
	ErrSearchWithEmptyQuery           = errors.New("search with empty query")
	StatusSearchWithEmptyQuery        = 6
	ErrNotFound                       = errors.New("not found")
	StatusNotFound                    = 7
	ErrSubdirectoryNotFound           = errors.New("subdirectory does not exist")
	StatusSubdirectoryNotFound        = 8
	ErrDirectoryNotSpecified          = errors.New("directory not specified")
	StatusDirectoryNotSpecified       = 9
	ErrDirNotSharing                  = errors.New("requested dir is not sharing")
	StatusDirNotSharing               = 10
	ErrMLService                      = errors.New("ml service returns error")
	StatusMLService                   = 11
	ErrExtNotValid                    = errors.New("file extension is not suitable for processing")
	StatusExtNotValid                 = 12
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

type SizeType int64

type File struct {
	ID          string
	Filename    string
	TimeCreated time.Time
	UserID      string
	Path        string
	Bucket      string
	IsDir       bool
	FileType    FileType
	Size        SizeType
	ContentType string
	Extension   string
	Status      StatusType
	Email       string

	IsShared       bool
	ShareAccess    AccessType
	IsShareByEmail bool
	ShareLink      string

	Link string

	Disk       DiskType
	CloudID    string
	CloudEmail string

	PageNumber int
	Timestart  int
	Duration   int

	IsFav bool

	MLData interface{}
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
	AllStorages  DiskType = "all"
	Own          DiskType = "own"
	GoogleDrive  DiskType = "google"
	YandexDisk   DiskType = "yandex"
	LocalStorage DiskType = "local"
)

type FileOptions struct {
	FileType              FileType
	Dir                   string
	UserID                string
	CloudEmail            string
	Disk                  string
	Limit                 int
	Offset                int
	Query                 string
	Status                StatusType
	IsSmartSearch         bool
	FirstNesting          bool
	DirsRequired          bool
	FilesRequired         bool
	SharedRequired        bool
	PersonalRequired      bool
	ExternalDisklRequired bool
	InternalDisklRequired bool
}

type FileOptionsV2 struct {
	FileType  FileType
	FileTypes []FileType

	Dir string

	DirsRequired  bool
	FilesRequired bool

	CloudEmail       string
	IgnoreCloudEmail bool

	UserID string

	Status StatusType

	FirstNesting bool

	Query string
	Smart bool
}

type RequestToShare struct {
	Path        string
	ShareAccess AccessType
	ByEmails    bool
	Emails      []string
}

type SharedDir struct {
	ID          string
	FileID      string
	UserID      string
	Accepted    bool
	ShareAccess AccessType
	Path        string
}

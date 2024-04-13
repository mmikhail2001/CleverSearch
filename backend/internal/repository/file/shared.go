package file

import (
	"regexp"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"go.mongodb.org/mongo-driver/bson"
)

func getFilter(fileOptions file.FileOptions) (bson.M, error) {
	filter := bson.M{}

	if fileOptions.FilesRequired && !fileOptions.DirsRequired {
		filter["is_dir"] = false
		if fileOptions.Status != "" {
			filter["status"] = fileOptions.Status
		}
	} else if !fileOptions.FilesRequired && fileOptions.DirsRequired {
		filter["is_dir"] = true
	} else if !fileOptions.FilesRequired && !fileOptions.DirsRequired {
		return bson.M{}, file.ErrNotFound
	}

	if fileOptions.Dir != "/" {
		filter["path"] = bson.M{"$regex": "^" + regexp.QuoteMeta(fileOptions.Dir) + "/"}
	}

	if fileOptions.UserID != "" {
		filter["user_id"] = fileOptions.UserID
	}

	if fileOptions.FileType != "" && fileOptions.FileType != file.AllTypes {
		filter["file_type"] = string(fileOptions.FileType)
	}

	if fileOptions.ExternalDisklRequired {
		filter["disk"] = "google"
		filter["cloud_email"] = fileOptions.CloudEmail
	}

	if !fileOptions.ExternalDisklRequired {
		filter["cloud_email"] = ""
		filter["disk"] = ""
	}

	return filter, nil
}

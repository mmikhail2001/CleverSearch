package file

import (
	"context"
	"log"
	"regexp"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
	"go.mongodb.org/mongo-driver/bson"
)

func getFilter(fileOptions file.FileOptions) (bson.M, error) {
	filter := bson.M{}
	log.Println("80")
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

	log.Println("81")

	return filter, nil
}

func UpdateFavs(ctx context.Context, fileDTOs []fileDTO, files *[]file.File) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return
	}
	userID := user.ID
	for i, dto := range fileDTOs {
		for _, favUserID := range dto.Favs {
			if favUserID == userID {
				(*files)[i].IsFav = true
				break
			}
		}
	}
}

func UpdateFav(ctx context.Context, fileDTO fileDTO, file *file.File) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return
	}
	userID := user.ID
	for _, favUserID := range fileDTO.Favs {
		if favUserID == userID {
			file.IsFav = true
			break
		}
	}
}

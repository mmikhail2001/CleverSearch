package file

import (
	"context"
	"errors"
	"log"
	"regexp"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/dranikpg/dto-mapper"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *Repository) GetFilesV2(ctx context.Context, fileOptions file.FileOptionsV2) ([]file.File, error) {
	filter := bson.M{}
	if fileOptions.FilesRequired && !fileOptions.DirsRequired {
		filter["is_dir"] = false
		if fileOptions.Status != "" {
			filter["status"] = fileOptions.Status
		}
	} else if !fileOptions.FilesRequired && fileOptions.DirsRequired {
		filter["is_dir"] = true
	} else if !fileOptions.FilesRequired && !fileOptions.DirsRequired {
		return []file.File{}, file.ErrNotFound
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

	if !fileOptions.IgnoreCloudEmail {
		filter["cloud_email"] = fileOptions.CloudEmail
	}

	opts := options.Find().SetSort(bson.D{{Key: "filename", Value: 1}})

	cursor, err := r.mongo.Collection("files").Find(ctx, filter, opts)
	if err != nil {
		log.Println("Get collection files error:", err)
		if errors.Is(err, mongo.ErrNoDocuments) {
			return []file.File{}, file.ErrNotFound
		}
		return nil, err
	}
	defer cursor.Close(ctx)

	var resultsDTO []fileDTO
	for cursor.Next(ctx) {
		var dto fileDTO
		err := cursor.Decode(&dto)
		if err != nil {
			return nil, err
		}
		resultsDTO = append(resultsDTO, dto)
	}

	results := make([]file.File, len(resultsDTO))
	err = dto.Map(&results, &resultsDTO)
	if err != nil {
		log.Println("Dto Map GetFiles repo error:", err)
		return nil, err
	}

	if err := cursor.Err(); err != nil {
		log.Println("Cursor error:", err)
		return nil, err
	}

	UpdateFavs(ctx, resultsDTO, &results)

	return results, nil
}

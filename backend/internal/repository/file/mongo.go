package file

import (
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/dranikpg/dto-mapper"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository struct {
	minio           *minio.Client
	mongo           *mongo.Database
	channelRabbitMQ *amqp.Channel
}

func NewRepository(minio *minio.Client, mongo *mongo.Database, channelRabbitMQ *amqp.Channel) *Repository {
	return &Repository{
		minio:           minio,
		mongo:           mongo,
		channelRabbitMQ: channelRabbitMQ,
	}
}

func (r *Repository) CreateFile(ctx context.Context, file file.File) error {
	var fileDTO fileDTO
	err := dto.Map(&fileDTO, &file)
	if err != nil {
		log.Println("Dto Map CreateFile repo error:", err)
		return err
	}

	collection := r.mongo.Collection("files")
	_, err = collection.InsertOne(ctx, fileDTO)
	if err != nil {
		log.Println("Failed to insert to mongo:", err)
		return err
	}
	return nil
}

func (r *Repository) DeleteFile(ctx context.Context, file file.File) error {
	_, err := r.mongo.Collection("files").DeleteOne(ctx, bson.M{"_id": file.ID})
	if err != nil {
		log.Println("Failed to delete file from MongoDB:", err)
		return err
	}
	return nil
}

func (r *Repository) CreateDir(ctx context.Context, file file.File) error {
	var fileDTO fileDTO
	err := dto.Map(&fileDTO, &file)
	if err != nil {
		log.Println("Dto Map CreateDir repo error:", err)
		return err
	}

	collection := r.mongo.Collection("files")
	_, err = collection.InsertOne(ctx, fileDTO)
	if err != nil {
		log.Println("Failed to insert to mongo:", err)
		return err
	}
	return nil
}

func (r *Repository) Search(ctx context.Context, fileOptions file.FileOptions) ([]file.File, error) {
	// TODO: Поиск не в рамках директории
	filter := bson.M{}
	if fileOptions.Query != "" {
		filter["filename"] = bson.M{"$regex": primitive.Regex{Pattern: fileOptions.Query, Options: "i"}}
	}

	if fileOptions.FilesRequired && !fileOptions.DirsRequired {
		filter["is_dir"] = false
	} else if !fileOptions.FilesRequired && fileOptions.DirsRequired {
		filter["is_dir"] = true
	} else if !fileOptions.FilesRequired && !fileOptions.DirsRequired {
		return []file.File{}, file.ErrNotFound
	}

	if fileOptions.UserID != "" {
		filter["user_id"] = fileOptions.UserID
	}

	if fileOptions.FileType != "" && fileOptions.FileType != file.AllTypes {
		filter["file_type"] = string(fileOptions.FileType)
	}

	opts := options.Find().SetSort(bson.D{{Key: "filename", Value: 1}})
	// opts = opts.SetLimit(int64(fileOptions.Limit)).SetSkip(int64(fileOptions.Offset))

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
			log.Println("Cursor Decode error:", err)
			return nil, err
		}
		resultsDTO = append(resultsDTO, dto)
	}

	results := make([]file.File, len(resultsDTO))
	err = dto.Map(&results, &resultsDTO)
	if err != nil {
		log.Println("Dto Map Search repo error:", err)
		return []file.File{}, err
	}

	if err := cursor.Err(); err != nil {
		log.Println("Cursor error:", err)
		return nil, err
	}

	return results, nil
}

func (r *Repository) GetFiles(ctx context.Context, fileOptions file.FileOptions) ([]file.File, error) {
	filter := bson.M{}

	if fileOptions.FileType != "" && fileOptions.FileType != file.AllTypes {
		filter["file_type"] = string(fileOptions.FileType)
	}

	if fileOptions.Dir != "/" {
		filter["path"] = bson.M{"$regex": "^" + regexp.QuoteMeta(fileOptions.Dir) + "/"}
	}

	if fileOptions.Status != "" && fileOptions.Status != "all" {
		filter["status"] = string(fileOptions.Status)
	}

	if fileOptions.FilesRequired && !fileOptions.DirsRequired {
		filter["is_dir"] = false
	} else if !fileOptions.FilesRequired && fileOptions.DirsRequired {
		filter["is_dir"] = true
	} else if !fileOptions.FilesRequired && !fileOptions.DirsRequired {
		return []file.File{}, file.ErrNotFound
	}

	if fileOptions.UserID != "" {
		filter["user_id"] = fileOptions.UserID
	}

	if fileOptions.CloudEmail != "" {
		filter["cloud_email"] = fileOptions.CloudEmail
	}

	// TODO: сортировка нужна по дате добавления
	opts := options.Find().SetSort(bson.D{{Key: "filename", Value: 1}})
	// opts = opts.SetLimit(int64(fileOptions.Limit)).SetSkip(int64(fileOptions.Offset))

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

	return results, nil
}

func (r *Repository) GetFileByID(ctx context.Context, uuidFile string) (file.File, error) {
	var resultDTO fileDTO

	filter := bson.M{"_id": uuidFile}
	err := r.mongo.Collection("files").FindOne(ctx, filter).Decode(&resultDTO)
	if err != nil {
		log.Println("GetFileByID: FindOne:", uuidFile, err)
		if errors.Is(err, mongo.ErrNoDocuments) {
			return file.File{}, file.ErrNotFound
		}
		return file.File{}, err
	}
	var fileRes file.File
	err = dto.Map(&fileRes, &resultDTO)
	if err != nil {
		log.Println("Dto Map GetFileByID repo error:", err)
		return file.File{}, err
	}

	return fileRes, nil
}

// TODO: объединить с GetFileByID
func (r *Repository) GetFileByPath(ctx context.Context, path string, userID string) (file.File, error) {
	var resultDTO fileDTO

	filter := bson.M{"path": path, "user_id": userID}
	err := r.mongo.Collection("files").FindOne(ctx, filter).Decode(&resultDTO)
	if err != nil {
		log.Println("GetFileByPath: FindOne:", path, err)
		if errors.Is(err, mongo.ErrNoDocuments) {
			return file.File{}, file.ErrNotFound
		}
		return file.File{}, err
	}
	var fileRes file.File
	err = dto.Map(&fileRes, &resultDTO)
	if err != nil {
		log.Println("Dto Map GetFileByID repo error:", err)
		return file.File{}, err
	}
	return fileRes, nil
}

func (r *Repository) GetSharedDirs(ctx context.Context, path string, userID string) ([]file.File, error) {
	filter := bson.M{}

	if path != "" {
		filter["path"] = path
	}
	if userID != "" {
		filter["user_id"] = userID
	}

	cursor, err := r.mongo.Collection("shared_dirs").Find(ctx, filter)
	if err != nil {
		log.Println("GetSharedDir: Find:", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var sharedDirs []file.File
	for cursor.Next(ctx) {
		var resultDTO sharedDirDTO
		err := cursor.Decode(&resultDTO)
		if err != nil {
			log.Println("GetSharedDir: Decode:", err)
			return nil, err
		}

		fileRes := file.File{
			// UserID:      resultDTO.UserID,
			ID:          resultDTO.FileID,
			IsShared:    true,
			ShareAccess: resultDTO.ShareAccess,
			Path:        resultDTO.Path,
		}
		sharedDirs = append(sharedDirs, fileRes)
	}

	if err := cursor.Err(); err != nil {
		log.Println("GetSharedDir: Cursor error:", err)
		return nil, err
	}

	if len(sharedDirs) == 0 {
		return []file.File{}, file.ErrNotFound
	}

	return sharedDirs, nil
}

func (r *Repository) Update(ctx context.Context, file file.File) error {
	update := bson.M{
		"$set": bson.M{
			"filename":     file.Filename,
			"status":       file.Status,
			"is_shared":    file.IsShared,
			"share_access": file.ShareAccess,
			"share_link":   file.ShareLink,
			"link":         file.Link,
		},
	}

	filter := bson.M{"_id": file.ID}
	_, err := r.mongo.Collection("files").UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update file: %w", err)
	}

	return nil
}

func (r *Repository) AddUserToSharingDir(ctx context.Context, file file.File, userID string, accessType file.AccessType) error {
	var existing sharedDirDTO
	filter := bson.M{"fileID": file.ID, "userID": userID}
	if file.UserID == userID {
		log.Println("The author cannot share with himself")
		return fmt.Errorf("the author cannot share with himself")
	}
	// TODO: костыль, нужен составной первичный ключ
	err := r.mongo.Collection("shared_dirs").FindOne(ctx, filter).Decode(&existing)
	if err == mongo.ErrNoDocuments {
		sharedDirs := sharedDirDTO{
			// TODO: UserID - это именно тот, с кем поделились (изменить название поля)
			// нужен AuthorID
			ID:          uuid.New().String(),
			FileID:      file.ID,
			UserID:      userID,
			ShareAccess: accessType,
			Path:        file.Path,
		}
		_, err := r.mongo.Collection("shared_dirs").InsertOne(ctx, sharedDirs)
		if err != nil {
			log.Println("Failed to insert to mongo 'shared_dirs':", err)
			return err
		}
		return nil
	} else if err != nil {
		log.Println("Failed to search in mongo 'shared_dirs':", err)
		return err
	}
	log.Println("The user is already added to the sharing directory.")
	return nil
}

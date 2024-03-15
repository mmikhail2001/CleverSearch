package file

import (
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/dranikpg/dto-mapper"
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
	filter := bson.M{}
	if fileOptions.Query != "" {
		filter["filename"] = bson.M{"$regex": primitive.Regex{Pattern: fileOptions.Query, Options: "i"}}
	}

	opts := options.Find().SetSort(bson.D{{Key: "filename", Value: 1}})
	opts = opts.SetLimit(int64(fileOptions.Limit)).SetSkip(int64(fileOptions.Offset))

	cursor, err := r.mongo.Collection("files").Find(ctx, filter, opts)
	if err != nil {
		log.Println("Get collection files error:", err)
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
	if fileOptions.FileType != file.AllTypes {
		filter["content_type"] = string(fileOptions.FileType)
	}

	if fileOptions.Dir != "all" {
		filter["path"] = bson.M{"$regex": "^" + regexp.QuoteMeta(fileOptions.Dir) + "/"}
	}

	if fileOptions.Shared {
		filter["is_shared"] = true
	}

	if fileOptions.Disk != "all" {
		filter["disk"] = fileOptions.Disk
	}

	if fileOptions.OnlyDirs {
		filter["is_dir"] = true
	} else {
		filter["is_dir"] = false
	}

	// TODO: сортировка нужна по дате добавления
	opts := options.Find().SetSort(bson.D{{Key: "filename", Value: 1}})
	opts = opts.SetLimit(int64(fileOptions.Limit)).SetSkip(int64(fileOptions.Offset))

	cursor, err := r.mongo.Collection("files").Find(ctx, filter, opts)
	if err != nil {
		log.Println("Get collection files error:", err)
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
	// TODO:
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
		if errors.Is(err, mongo.ErrNoDocuments) {
			return file.File{}, fmt.Errorf("GetFileByID no file with uuid: %w", err)
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
func (r *Repository) GetFileByPath(ctx context.Context, path string) (file.File, error) {
	var resultDTO fileDTO

	filter := bson.M{"path": path}
	err := r.mongo.Collection("files").FindOne(ctx, filter).Decode(&resultDTO)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return file.File{}, fmt.Errorf("GetFileByPath no file with path %v: %w", path, err)
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

func (r *Repository) Update(ctx context.Context, file file.File) error {
	update := bson.M{
		"$set": bson.M{
			"filename": file.Filename,
			"status":   file.Status,
		},
	}

	filter := bson.M{"_id": file.ID}
	_, err := r.mongo.Collection("files").UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update file: %w", err)
	}

	return nil
}

package file

import (
	"context"
	"errors"
	"fmt"
	"log"
	"path/filepath"

	"github.com/minio/minio-go/v7"
	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var bucketName string = "test"
var minioHost string = "localhost:9000"
var channelName string = "test-queue"

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
	dto := fileDTO{
		ID:          file.ID,
		Filename:    file.Filename,
		Size:        file.Size,
		ContentType: file.ContentType,
		Extension:   filepath.Ext(file.Filename),
		Status:      file.Status,
		S3URL:       file.S3URL,
		UserID:      file.UserID,
		Path:        file.Path,
		TimeCreated: file.TimeCreated,
		IsDir:       file.IsDir,
		IsShared:    file.IsShared,
	}

	collection := r.mongo.Collection("files")
	_, err := collection.InsertOne(ctx, dto)
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
	for i, fileDTO := range resultsDTO {
		results[i] = file.File{
			ID:          fileDTO.ID,
			Filename:    fileDTO.Filename,
			Size:        fileDTO.Size,
			ContentType: fileDTO.ContentType,
			Status:      fileDTO.Status,
			S3URL:       fileDTO.S3URL,
			TimeCreated: fileDTO.TimeCreated,
			UserID:      fileDTO.UserID,
			Path:        fileDTO.Path,
			IsDir:       fileDTO.IsDir,
			IsShared:    fileDTO.IsShared,
			Extension:   fileDTO.Extension,
		}
	}

	if err := cursor.Err(); err != nil {
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
		filter["path"] = fileOptions.Dir
	}

	if fileOptions.Shared {
		filter["is_shared"] = true
	}

	if fileOptions.Disk != "all" {
		filter["disk"] = fileOptions.Disk
	}

	// сортировка нужна по дате добавления
	opts := options.Find().SetSort(bson.D{{Key: "filename", Value: 1}})
	opts = opts.SetLimit(int64(fileOptions.Limit)).SetSkip(int64(fileOptions.Offset))

	cursor, err := r.mongo.Collection("files").Find(ctx, filter, opts)
	if err != nil {
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
	for i, fileDTO := range resultsDTO {
		results[i] = file.File{
			ID:          fileDTO.ID,
			Filename:    fileDTO.Filename,
			Size:        fileDTO.Size,
			ContentType: fileDTO.ContentType,
			Status:      fileDTO.Status,
			S3URL:       fileDTO.S3URL,
			TimeCreated: fileDTO.TimeCreated,
			UserID:      fileDTO.UserID,
			Path:        fileDTO.Path,
			IsDir:       fileDTO.IsDir,
			IsShared:    fileDTO.IsShared,
			Extension:   fileDTO.Extension,
		}
	}

	if err := cursor.Err(); err != nil {
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
	file := file.File{
		ID:          resultDTO.ID,
		Filename:    resultDTO.Filename,
		Size:        resultDTO.Size,
		ContentType: resultDTO.ContentType,
		Status:      resultDTO.Status,
		S3URL:       resultDTO.S3URL,
	}

	return file, nil
}

func (r *Repository) Update(ctx context.Context, file file.File) error {
	update := bson.M{
		"$set": bson.M{
			"filename": file.Filename,
			"status":   file.Status,
			"url_s3":   file.S3URL,
		},
	}

	filter := bson.M{"_id": file.ID}
	_, err := r.mongo.Collection("files").UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update file: %w", err)
	}

	return nil
}

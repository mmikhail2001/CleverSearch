package file

import (
	"context"
	"errors"
	"fmt"
	"log"

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
	// TODO: Поиск не в рамках директории
	filter, err := getFilter(fileOptions)
	if err != nil {
		return []file.File{}, err
	}

	if fileOptions.Query != "" {
		filter["filename"] = bson.M{"$regex": primitive.Regex{Pattern: fileOptions.Query, Options: "i"}}
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

	UpdateFavs(ctx, resultsDTO, &results)

	return results, nil
}

func (r *Repository) GetFiles(ctx context.Context, fileOptions file.FileOptions) ([]file.File, error) {
	filter, err := getFilter(fileOptions)
	if err != nil {
		return []file.File{}, err
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

	UpdateFavs(ctx, resultsDTO, &results)

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

	UpdateFav(ctx, resultDTO, &fileRes)

	return fileRes, nil
}

// TODO: объединить с GetFileByID
func (r *Repository) GetFileByPath(ctx context.Context, path string, userID string) (file.File, error) {
	var resultDTO fileDTO

	var filter bson.M
	if userID != "" {
		filter = bson.M{"path": path, "user_id": userID}
	} else {
		filter = bson.M{"path": path}
	}

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

	UpdateFav(ctx, resultDTO, &fileRes)

	return fileRes, nil
}

func (r *Repository) GetSharedDirs(ctx context.Context, path string, userID string, accepted bool) ([]file.File, error) {
	filter := bson.M{}

	if path != "" {
		filter["path"] = path
	}
	if userID != "" {
		filter["user_id"] = userID
	}

	filter["accepted"] = accepted

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
			ShareAccess: file.AccessType(resultDTO.ShareAccess),
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
			"filename":          file.Filename,
			"status":            file.Status,
			"is_shared":         file.IsShared,
			"share_access":      file.ShareAccess,
			"share_link":        file.ShareLink,
			"is_share_by_email": file.IsShareByEmail,
			"link":              file.Link,
		},
	}

	filter := bson.M{"_id": file.ID}
	_, err := r.mongo.Collection("files").UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update file: %w", err)
	}

	return nil
}

func (r *Repository) GetSharedDir(ctx context.Context, fileID string, userID string) (file.SharedDir, error) {
	var sharedDirDTO sharedDirDTO
	filter := bson.M{"file_id": fileID, "user_id": userID}

	if err := r.mongo.Collection("shared_dirs").FindOne(ctx, filter).Decode(&sharedDirDTO); err != nil {
		if err == mongo.ErrNoDocuments {
			log.Println("Get shared dir no found", err)
			return file.SharedDir{}, file.ErrNotFound
		}
		log.Println("Failed to search in mongo 'shared_dirs':", err)
		return file.SharedDir{}, err
	}

	var sharedDir file.SharedDir
	if err := dto.Map(&sharedDir, &sharedDirDTO); err != nil {
		log.Println("Failed to map sharedDirDTO to SharedDir:", err)
		return file.SharedDir{}, err
	}

	return sharedDir, nil
}

func (r *Repository) InsertSharedDir(ctx context.Context, sharedDir file.SharedDir) error {
	var sharedDirDTO sharedDirDTO
	err := dto.Map(&sharedDirDTO, sharedDir)
	if err != nil {
		log.Println("Err map shared dirs:", err)
		return err
	}

	_, err = r.mongo.Collection("shared_dirs").InsertOne(ctx, sharedDirDTO)
	if err != nil {
		log.Println("Failed to insert to mongo 'shared_dirs':", err)
		return err
	}
	return nil
}

func (r *Repository) UpdateSharedDir(ctx context.Context, sharedDir file.SharedDir) (file.SharedDir, error) {
	var existing sharedDirDTO
	filter := bson.M{"file_id": sharedDir.FileID, "user_id": sharedDir.UserID}

	if err := r.mongo.Collection("shared_dirs").FindOne(ctx, filter).Decode(&existing); err != nil {
		if err == mongo.ErrNoDocuments {
			log.Println("Shared directory not found for update")
			return file.SharedDir{}, file.ErrNotFound
		}
		log.Println("Failed to search in mongo 'shared_dirs':", err)
		return file.SharedDir{}, err
	}

	var sharedDirDTO sharedDirDTO
	if err := dto.Map(&sharedDirDTO, &sharedDir); err != nil {
		log.Println("Failed to map SharedDir to sharedDirDTO:", err)
		return file.SharedDir{}, err
	}

	update := bson.M{"$set": sharedDirDTO}
	if _, err := r.mongo.Collection("shared_dirs").UpdateOne(ctx, filter, update); err != nil {
		log.Println("Failed to update shared directory:", err)
		return file.SharedDir{}, err
	}

	return sharedDir, nil
}

func (r *Repository) GetFileByCloudID(ctx context.Context, cloudID string) (file.File, error) {
	var resultDTO fileDTO

	filter := bson.M{"cloud_id": cloudID}
	err := r.mongo.Collection("files").FindOne(ctx, filter).Decode(&resultDTO)
	if err != nil {
		log.Println("GetFileByID: FindOne:", cloudID, err)
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

	UpdateFav(ctx, resultDTO, &fileRes)

	return fileRes, nil
}

func (r *Repository) GetFavs(ctx context.Context, userID string) ([]file.File, error) {
	filter := bson.M{"favs": userID}
	cursor, err := r.mongo.Collection("files").Find(ctx, filter)
	if err != nil {
		log.Println("GetFavs error:", err)
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

func (r *Repository) AddFav(ctx context.Context, userID string, fileID string) error {
	isNull, err := r.isFavsNull(ctx, fileID)
	if err != nil {
		log.Println("AddFav: isFavsNull: err", err)
		return err
	}

	// Если поле "favs" равно null, инициализируем его пустым массивом
	if isNull {
		err := r.initializeFavsField(ctx, fileID)
		if err != nil {
			log.Println("AddFav: initializeFavsField: err", err)
			return err
		}
	}

	filter := bson.M{"_id": fileID}
	update := bson.M{"$addToSet": bson.M{"favs": userID}}
	_, err = r.mongo.Collection("files").UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("AddFav error:", err)
		return err
	}
	return nil
}

func (r *Repository) isFavsNull(ctx context.Context, fileID string) (bool, error) {
	filter := bson.M{"_id": fileID, "favs": nil}
	count, err := r.mongo.Collection("files").CountDocuments(ctx, filter)
	if err != nil {
		log.Println("isFavsNull error:", err)
		return false, err
	}
	return count > 0, nil
}

func (r *Repository) initializeFavsField(ctx context.Context, fileID string) error {
	filter := bson.M{"_id": fileID}
	update := bson.M{"$set": bson.M{"favs": []string{}}}

	result, err := r.mongo.Collection("files").UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("initializeFavsField error:", err)
		return err
	}

	if result.ModifiedCount == 0 && result.UpsertedCount == 0 {
		return errors.New("favs field was not initialized")
	}
	return nil
}

func (r *Repository) DeleteFav(ctx context.Context, userID string, fileID string) error {
	filter := bson.M{"_id": fileID}
	update := bson.M{"$pull": bson.M{"favs": userID}}
	result, err := r.mongo.Collection("files").UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("DeleteFav error:", err)
		return err
	}
	if result.ModifiedCount == 0 {
		log.Println("file not found or user not in favs")
		return nil
	}
	return nil
}

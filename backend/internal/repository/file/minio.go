package file

import (
	"context"
	"log"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
)

// TODO: Link только 7 дней...
var shareLinkTimeExpires = time.Hour * 24 * 7

// TODO:
// можно в отдельной горутине загружать файл или несолько файлов (PutObject)
// - minio.PutObjectOptions{ Progress : myreader } следить за состоянием
// - уведомить клиента о том, что файл начал загружаться
// - а до этого всего уже создать в mongo запись о том, что файл на загрузке в s3

// можно не отвечать фронту, пока не загрузим файл PutObject
func (r *Repository) UploadToStorage(ctx context.Context, file file.File) (file.File, error) {
	exists, err := r.minio.BucketExists(ctx, file.Bucket)
	if err != nil {
		log.Println("Failed to check bucket existence:", err)
		return file, err
	}

	// Если бакет не существует, создаем его
	if !exists {
		log.Println("Bucket does not exist. Creating bucket:", file.Bucket)
		err = r.minio.MakeBucket(ctx, file.Bucket, minio.MakeBucketOptions{})
		if err != nil {
			log.Println("Failed to create bucket:", err)
			return file, err
		}
		log.Println("Bucket created successfully:", file.Bucket)
	}

	_, err = r.minio.PutObject(ctx, file.Bucket, file.Path, file.File, file.Size, minio.PutObjectOptions{ContentType: file.ContentType})
	if err != nil {
		log.Println("Failed to PutObject minio:", err)
		return file, err
	}

	presignedURL, err := r.minio.PresignedGetObject(ctx, file.Bucket, file.Path, shareLinkTimeExpires, nil)
	if err != nil {
		log.Println("Failed to generate presigned URL:", err)
		return file, err
	}
	file.Link = presignedURL.String()

	return file, nil
}

func (r *Repository) RemoveFromStorage(ctx context.Context, file file.File) error {
	err := r.minio.RemoveObject(ctx, file.Bucket, file.Path, minio.RemoveObjectOptions{})
	if err != nil {
		log.Println("Failed to RemoveObject from MinIO:", err)
		return err
	}
	return nil
}

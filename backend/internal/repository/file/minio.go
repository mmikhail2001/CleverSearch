package file

import (
	"context"
	"io"
	"log"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/minio/minio-go/v7"
)

// TODO:
// можно в отдельной горутине загружать файл или несолько файлов (PutObject)
// - minio.PutObjectOptions{ Progress : myreader } следить за состоянием
// - уведомить клиента о том, что файл начал загружаться
// - а до этого всего уже создать в mongo запись о том, что файл на загрузке в s3

// можно не отвечать фронту, пока не загрузим файл PutObject
func (r *Repository) UploadToStorage(ctx context.Context, fileReader io.Reader, file file.File) (file.File, error) {
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

	_, err = r.minio.PutObject(ctx, file.Bucket, file.Path, fileReader, file.Size, minio.PutObjectOptions{ContentType: file.ContentType})
	if err != nil {
		log.Println("Failed to PutObject minio:", err)
		return file, err
	}

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

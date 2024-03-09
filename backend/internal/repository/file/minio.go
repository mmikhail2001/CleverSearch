package file

import (
	"context"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
)

// TODO:
// можно в отдельной горутине загружать файл или несолько файлов (PutObject)
// - minio.PutObjectOptions{ Progress : myreader } следить за состоянием
// - уведомить клиента о том, что файл начал загружаться
// - а до этого всего уже создать в mongo запись о том, что файл на загрузке в s3

// можно не отвечать фронту, пока не загрузим файл PutObject
func (r *Repository) Upload(ctx context.Context, file file.File) (file.File, error) {
	_, err := r.minio.PutObject(ctx, bucketName, file.Path, file.File, file.Size, minio.PutObjectOptions{ContentType: file.ContentType})
	if err != nil {
		log.Println("Failed to PutObject minio:", err)
		return file, err
	}
	file.S3URL = "https://" + minioHost + "/" + bucketName + "/" + file.Path
	return file, nil
}

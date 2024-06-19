package file

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
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
		log.Println("Failed to check bucket [", file.Bucket, "] existence:", exists, "err: ", err)
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
		policy := fmt.Sprintf(`{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"*"},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}`, file.Bucket)
		err = r.minio.SetBucketPolicy(context.Background(), file.Bucket, policy)
		if err != nil {
			log.Println("Failed to set bucket policy :", err)
			return file, err
		}
		log.Println("Bucket created successfully:", file.Bucket)
	}

	_, err = r.minio.PutObject(ctx, file.Bucket, file.Path, fileReader, int64(file.Size), minio.PutObjectOptions{ContentType: file.ContentType})
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
	isEmpty, err := r.IsBucketEmpty(ctx, file.Bucket)
	if err != nil {
		log.Println("Failed to check if bucket is empty:", err)
		return err
	}

	if isEmpty {
		err := r.minio.RemoveBucket(ctx, file.Bucket)
		if err != nil {
			log.Println("Failed to remove empty bucket from MinIO:", err)
			return err
		}
	}

	return nil
}

func (r *Repository) BucketExists(ctx context.Context, bucketName string) (bool, error) {
	exists, err := r.minio.BucketExists(ctx, bucketName)
	if err != nil {
		log.Println("Failed to check if bucket exists in MinIO:", err)
		return false, err
	}
	return exists, nil
}

func (r *Repository) IsBucketEmpty(ctx context.Context, bucketName string) (bool, error) {
	objects := r.minio.ListObjects(ctx, bucketName, minio.ListObjectsOptions{Recursive: false})

	for object := range objects {
		if object.Err != nil {
			log.Println("Failed to list object:", object.Err)
			return false, object.Err
		}
		return false, nil
	}
	return true, nil
}

func (r *Repository) DownloadFile(ctx context.Context, filePath string) (io.ReadCloser, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println("User not found in context")
		return nil, sharederrors.ErrUserNotFoundInContext
	}

	object, err := r.minio.GetObject(ctx, user.Bucket, filePath, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	return object, nil
}

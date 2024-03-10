package minio

import (
	"log"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var endpoint string = "minio:9000"
var accessKeyID string = "minioadmin"
var secretAccessKey string = "minioadmin"
var useSSL bool = false

var retryCount = 5
var retryInterval = 2 * time.Second

func NewClient() (*minio.Client, error) {
	var minioClient *minio.Client
	var err error

	for i := 0; i < retryCount; i++ {
		minioClient, err = minio.New(endpoint, &minio.Options{
			Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
			Secure: useSSL,
		})
		if err == nil {
			break
		}
		log.Println("retry to connect minio")
		time.Sleep(retryInterval)
	}

	if err != nil {
		log.Println("Failed to connect minio:", err)
		return nil, err
	}
	return minioClient, nil
}

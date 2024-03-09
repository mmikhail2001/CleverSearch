package minio

import (
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var endpoint string = "localhost:9000"
var accessKeyID string = "minioadmin"
var secretAccessKey string = "minioadmin"
var useSSL bool = false

func NewClient() (*minio.Client, error) {
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Println("Failed to connect minio:", err)
		return nil, err
	}
	return minioClient, nil
}

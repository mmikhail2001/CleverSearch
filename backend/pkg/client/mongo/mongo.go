package mongo

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoURI string = "mongodb://USERNAME:PASSWORD@mongodb:27017"
var mongoDBName string = "CLEVERSEARCH"

var retryCount = 5
var retryInterval = 2 * time.Second

func ConnectWithRetry(ctx context.Context, options *options.ClientOptions) (*mongo.Client, error) {
	var client *mongo.Client
	var err error

	for i := 0; i < retryCount; i++ {
		client, err = mongo.Connect(ctx, options)
		if err == nil {
			return client, nil
		}
		log.Println("retry to connect mongodb")
		time.Sleep(retryInterval)
	}

	return nil, err
}

func NewClient() (*mongo.Database, error) {
	clientOptions := options.Client().ApplyURI(mongoURI)

	var client *mongo.Client
	var err error

	for i := 0; i < retryCount; i++ {
		client, err = mongo.Connect(context.Background(), clientOptions)
		if err == nil {
			break
		}
		log.Println("retry to connect mongodb")
		time.Sleep(retryInterval)
	}

	if err != nil {
		log.Println("Failed to connect mongo:", err)
		return nil, err
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Println("Failed to ping mongo:", err)
		return nil, err
	}
	db := client.Database(mongoDBName)
	return db, nil
}

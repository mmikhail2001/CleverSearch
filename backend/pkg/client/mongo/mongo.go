package mongo

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoURI string = "mongodb://USERNAME:PASSWORD@127.0.0.1:27018"
var mongoDBName string = "CLEVERSEARCH"

func NewClient() (*mongo.Database, error) {
	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(context.TODO(), clientOptions)

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

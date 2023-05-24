package config

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"time"
)

var DbClient *mongo.Client = ConnectDB()

func ConnectDB() *mongo.Client {
	credential := options.Credential{
		Username: EnvGetValue("MONGODB_ROOT_USERNAME"),
		Password: EnvGetValue("MONGODB_ROOT_PASSWORD"),
	}

	client, err := mongo.NewClient(options.Client().ApplyURI(EnvGetValue("MONGODB_URL")).SetAuth(credential))
	if err != nil {
		log.Fatalf("failed to create mongo client: %v\n", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatalf("failed to connect to database: %v\n", err)
	}
	// ping db
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("failed to ping database: %v\n", err)
	}

	log.Println("connected to MongoDB")
	return client
}

func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	return client.Database(EnvGetValue("MONGODB_DATABASE")).Collection(collectionName)
}

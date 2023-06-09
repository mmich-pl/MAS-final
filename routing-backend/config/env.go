package config

import (
	"github.com/joho/godotenv"
	"log"
	"os"
)

func EnvGetValue(key string) string {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v\n", err)
	}
	return os.Getenv(key)
}

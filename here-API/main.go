package main

import (
	"github.com/gin-gonic/gin"
	"here-API/config"
)

func main() {
	router := gin.Default()

	config.ConnectDB()
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"data": "Hello from Gin-gonic & mongoDB",
		})
	})

	err := router.Run(":6000")
	if err != nil {
		return
	}
}

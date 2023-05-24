package main

import (
	"github.com/gin-gonic/gin"
	"here-API/routes"
)

func main() {
	router := gin.Default()

	//config.ConnectDB()
	routes.HereRoute(router)

	err := router.Run(":8848")
	if err != nil {
		return
	}
}

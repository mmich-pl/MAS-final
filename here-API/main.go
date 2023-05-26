package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"here-API/config"
	"here-API/routes"
	"log"
)

func main() {
	router := gin.Default()

	routes.HereRoute(router)

	err := router.Run(fmt.Sprintf(":%s", config.EnvGetValue("PORT")))
	if err != nil {
		log.Fatalln(err)
		return
	}
	log.Printf("Application running on port %s", config.EnvGetValue("PORT"))
}

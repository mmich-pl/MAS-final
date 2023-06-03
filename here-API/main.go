package main

import (
	"fmt"
	"here-API/config"
	"here-API/middleware"
	"here-API/routes"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.New()
	router.Use(middleware.DefaultStructuredLogger())
	router.Use(gin.Recovery())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4200"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.HereRoute(router)

	err := router.Run(fmt.Sprintf(":%s", config.EnvGetValue("PORT")))
	if err != nil {
		log.Fatalln(err)
		return
	}
	log.Printf("Application running on port %s", config.EnvGetValue("PORT"))
}

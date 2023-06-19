package main

import (
	"fmt"
	"here-API/config"
	"here-API/middleware"
	"here-API/routes"
	"log"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.New()
	router.Use(middleware.DefaultStructuredLogger())
	router.Use(gin.Recovery())

	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return strings.HasPrefix(origin, "http://localhost")
		},
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"},
		AllowHeaders:  []string{"Origin", "Content-Length", "Content-Type"},
		ExposeHeaders: []string{"X-Total-Count"},
	}))

	routes.HereRoute(router)

	err := router.Run(fmt.Sprintf(":%s", config.EnvGetValue("PORT")))
	if err != nil {
		log.Fatalln(err)
		return
	}
	log.Printf("Application running on port %s", config.EnvGetValue("PORT"))
}

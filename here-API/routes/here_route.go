package routes

import (
	"github.com/gin-gonic/gin"
	"here-API/controllers"
)

func HereRoute(router *gin.Engine) {
	router.POST("/geocodes", controllers.GetGeocoding)
}

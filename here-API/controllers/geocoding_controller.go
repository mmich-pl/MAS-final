package controllers

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"here-API/client"
	"here-API/config"
	"here-API/models"
	"io"
	"net/http"
)

var geocodingCollection = config.GetCollection(config.DbClient, "geocoding")

func sendRequestDoAPI(c *gin.Context, params map[string]string) (data struct {
	Items []models.Geocoding `json:"items"`
}) {
	resp, apiErr := client.Get(config.EnvGetValue("API_BASE_URL"), params)
	if apiErr != nil {
		c.JSON(apiErr.Status(), apiErr.Message())
		return
	}

	apiErr = client.GetDataFromBody(resp, &data)
	if apiErr != nil {
		c.JSON(apiErr.Status(), apiErr.Message())
		return
	}
	return data
}

func GetGeocoding(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	defer c.Request.Body.Close()
	params := map[string]string{}

	err = json.Unmarshal(body, &params)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	data := sendRequestDoAPI(c, params)

	result, err := geocodingCollection.InsertOne(c, data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

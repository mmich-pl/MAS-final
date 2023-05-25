package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	. "here-API/client"
	"here-API/config"
	"here-API/errors"
	"here-API/models"
	"io"
	"net/http"
)

//var geocodingCollection = config.GetCollection(config.DbClient, "geocoding")

func sendGeocodingRequest(c *gin.Context, apiUrl string, address *models.AddressRequest) (data *struct {
	Items []models.Geocoding `json:"items"`
}, apiError errors.ApiError) {

	client := NewClient()
	request, err := http.NewRequest(http.MethodGet, apiUrl, nil)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}
	q := request.URL.Query()
	client.AddGeocodingParams(&q, address)
	request.URL.RawQuery = q.Encode()

	resp, apiErr := client.Get(request)
	if apiErr != nil {
		c.JSON(apiErr.Status(), apiErr.Message())
		return
	}

	apiErr = client.GetDataFromBody(resp, &data)
	if apiErr != nil {
		c.JSON(apiErr.Status(), apiErr.Message())
		return
	}
	return data, nil
}

func GetGeocoding(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	defer c.Request.Body.Close()
	var address models.AddressRequest

	err = json.Unmarshal(body, &address)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	data, apiErr := sendGeocodingRequest(c, config.EnvGetValue("API_GEOCODING_URL"), &address)
	if apiErr != nil {
		c.JSON(apiErr.Status(), apiErr.Message())
	}

	//result, err := geocodingCollection.InsertOne(c, data)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, err.Error())
	//	return
	//}

	c.JSON(http.StatusOK, data)
}

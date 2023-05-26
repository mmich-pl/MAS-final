package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	. "here-API/client"
	"here-API/config"
	"here-API/errors"
	"here-API/models"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

var geocodingCollection = config.GetCollection(config.DbClient, "geocoding")

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

func findGeocodes(address models.AddressRequest) (*models.Geocoding, errors.ApiError) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var geocodes models.Geocoding
	number, street, _ := strings.Cut(address.Street, " ")
	filter := bson.M{"address.street": street,
		"address.housenumber": number, "address.city": address.City}
	err := geocodingCollection.FindOne(ctx, filter).Decode(&geocodes)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}
	return &geocodes, nil
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

	codes, apiErr := findGeocodes(address)
	if codes != nil {
		c.JSON(http.StatusOK, codes)
		return
	} else {
		log.Println(apiErr)
	}

	data, apiErr := sendGeocodingRequest(c, config.EnvGetValue("API_GEOCODING_URL"), &address)
	if apiErr != nil {
		log.Println(apiErr.Status(), apiErr.Message())
	}
	codes = &data.Items[0]

	result, err := geocodingCollection.InsertOne(c, codes)
	log.Println(result)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, codes)
}

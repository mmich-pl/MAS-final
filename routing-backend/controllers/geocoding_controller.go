package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/bson"
	. "here-API/client"
	"here-API/config"
	"here-API/errors"
	"here-API/models"
	"io"
	"net/http"
	"strings"
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

func getMatchingAddress[T interface{}](filter bson.M) (*T, errors.ApiError) {
	var geocodes T
	log.Print(filter)
	err := geocodingCollection.FindOne(context.Background(), filter).Decode(&geocodes)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}
	return &geocodes, nil
}

func getMatchingAddresses[T interface{}](filter bson.M) (*[]T, errors.ApiError) {
	var geocodes []T
	log.Print(filter)
	col, err := geocodingCollection.Find(context.Background(), filter)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}

	for col.Next(context.Background()) {
		var elem T
		err = col.Decode(&elem)
		if err != nil {
			return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
		}
		geocodes = append(geocodes, elem)
	}

	if err = col.Err(); err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}

	col.Close(context.Background())

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

	index := strings.LastIndex(address.Street, " ")
	street := address.Street[:index]
	number := address.Street[index+1:]
	filter := bson.M{"address.street": street, "address.housenumber": number, "address.city": address.City}

	codes, apiErr := getMatchingAddress[models.Geocoding](filter)
	if codes != nil {
		c.JSON(http.StatusOK, codes)
		return
	} else {
		log.Error().Msg(apiErr.Message())
	}

	data, apiErr := sendGeocodingRequest(c, config.EnvGetValue("API_GEOCODING_URL"), &address)
	if apiErr != nil {
		log.Error().Msg(apiErr.Message())
	}
	codes = &data.Items[0]
	codes.Address.Street = strings.ReplaceAll(codes.Address.Street, "ulica ", "")
	codes.Address.Street = strings.ReplaceAll(codes.Address.Street, "aleja ", "")

	result, err := geocodingCollection.InsertOne(c, codes)
	log.Info().Msg(fmt.Sprintf("%v", result))
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, codes)
}

func GetAddress(c *gin.Context) {
	params, exists := c.GetQuery("street")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "street query parameters is required"})
		return
	}
	filter := bson.M{"address.street": bson.M{"$regex": params, "$options": "i"}}

	codes, apiErr := getMatchingAddresses[models.Geocoding](filter)
	if codes != nil {
		c.JSON(http.StatusOK, codes)
		return
	} else {
		log.Error().Msg(apiErr.Message())
		c.JSON(http.StatusBadRequest, apiErr.Message())
		return
	}
}

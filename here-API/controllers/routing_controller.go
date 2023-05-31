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
	"time"
)

var routingCollection = config.GetCollection(config.DbClient, "routes")

func findRoute(route models.RouteRequest) (*models.Route, errors.ApiError) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var result models.Route

	filter := bson.M{"origin.lat": route.Origin[0], "origin.lng": route.Origin[1],
		"destination.lat": route.Destination[0], "destination.lng": route.Destination[1]}
	err := routingCollection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}
	return &result, nil
}

func sendRouteRequest(c *gin.Context, apiUrl string, route *models.RouteRequest) (data *struct {
	Routes []models.Route `json:"routes"`
}, apiErr errors.ApiError) {
	client := NewClient()
	request, err := http.NewRequest(http.MethodGet, apiUrl, nil)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}
	q := request.URL.Query()
	client.AddRoutingParams(&q, route)
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

func GetRoute(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	defer c.Request.Body.Close()
	var route models.RouteRequest

	err = json.Unmarshal(body, &route)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	resultRoute, apiErr := findRoute(route)
	if resultRoute != nil {
		c.JSON(http.StatusOK, resultRoute)
		return
	} else {
		log.Error().Msg(apiErr.Message())
	}

	data, apiErr := sendRouteRequest(c, config.EnvGetValue("API_ROUTING_URL"), &route)
	if apiErr != nil {
		log.Error().Msg(apiErr.Message())
	}
	resultRoute = &data.Routes[0]
	resultRoute.Origin = &resultRoute.Sections[0].Departure.Place.Location
	resultRoute.Destination = &resultRoute.Sections[len(resultRoute.Sections)-1].Arrival.Place.Location

	result, err := routingCollection.InsertOne(c, resultRoute)
	log.Info().Msg(fmt.Sprintf("%v", result))
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, resultRoute)
}

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

	data, apiErr := sendRouteRequest(c, config.EnvGetValue("API_ROUTING_URL"), &route)
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

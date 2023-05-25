package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"here-API/client"
	"here-API/config"
	"here-API/models"
	"html"
	"io"
	"net/http"
)

//var geocodingCollection = config.GetCollection(config.DbClient, "geocoding")

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

func buildQueryString(address models.AddressRequest) string {
	return html.EscapeString(fmt.Sprintf("%s, %s %s, %s",
		address.Street, address.PostalCode, address.City, address.County))
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

	data := sendRequestDoAPI(c, map[string]string{"q": buildQueryString(address)})

	//result, err := geocodingCollection.InsertOne(c, data)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, err.Error())
	//	return
	//}

	c.JSON(http.StatusOK, data)
}

package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"here-API/mocks"
	"here-API/models"
	"io"
	"log"
	"net/http"
	"testing"
)

func Test(t *testing.T) {
	tests := []struct {
		name string
		api  func(t *testing.T) *mocks.MockHereAPI
	}{{
		name: "Valid Json",
		api: func(t *testing.T) *mocks.MockHereAPI {
			a := mocks.NewMockHereAPI(t)
			content := `{"items":[{"access":[{"lat":52.22814,"lng":21.00429}],"address":{"city":"Warszawa","countryCode":"POL",
			"countryName":"Polska","county":"Warszawa","district":"Śródmieście","houseNumber":"65",
			"label":"Aleje Jerozolimskie 65, 00-697 Śródmieście, Polska","postalCode":"00-697","state":"Woj. Mazowieckie",
			"street":"Aleje Jerozolimskie","subdistrict":"Śródmieście Południowe"},"houseNumberType":"PA",
			"id":"here:af:streetsection:3XrGNGcs8VTpRMqZ5HSXbB:CggIBCDH8aTuAhABGgI2NQ","mapView":{"east":21.0063,
			"north":52.2286,"south":52.2268,"west":21.00336},"position":{"lat":52.2277,"lng":21.00483},
			"resultType":"houseNumber","scoring":{"fieldScore":{"city":1,"country":0.95,"houseNumber":1,
			"postalCode":0.75,"streets":[1]},"queryScore":0.81},"title":"Aleje Jerozolimskie 65, 00-697 Śródmieście, Polska"}]}`
			responseBody := io.NopCloser(bytes.NewReader([]byte(content)))

			a.EXPECT().Geocode().Return(
				&http.Response{
					Body: responseBody,
				}, nil)
			return a
		},
	}}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			api := test.api(t)
			// Define the struct to hold the JSON data
			response, _ := api.Geocode()
			respBody, _ := io.ReadAll(response.Body)
			type Data struct {
				Items []models.Geocoding `json:"items"`
			}

			// Unmarshal JSON into struct
			var data Data
			err := json.Unmarshal(respBody, &data)
			if err != nil {
				log.Fatal(err)
			}

			// Access the first item
			if len(data.Items) > 0 {
				geocoding := data.Items[0]
				fmt.Println(geocoding.Address)
				fmt.Println(geocoding.Position)
				fmt.Println(geocoding.MapView)
			} else {
				fmt.Println("No items found in the JSON data")
			}

			assert.Equal(t, len(data.Items), 1)
		})
	}
}

package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"here-API/mocks"
	"here-API/models"
	"io"
	"net/http"
	"testing"
)

func TestGetGeocoding(t *testing.T) {
	testCase := struct {
		name string
		api  func(t *testing.T) *mocks.MockHereAPI
	}{
		name: "Geocoding - valid json",
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
	}
	t.Run(testCase.name, func(t *testing.T) {
		api := testCase.api(t)
		response, _ := api.Geocode()
		respBody, _ := io.ReadAll(response.Body)
		type Data struct {
			Items []models.Geocoding `json:"items"`
		}

		var data Data
		err := json.Unmarshal(respBody, &data)
		if err != nil {
			log.Fatal().Msg(fmt.Sprintf("%v", err))
		}

		if len(data.Items) > 0 {
			geocoding := data.Items[0]
			fmt.Println(geocoding)
		} else {
			fmt.Println("No items found in the JSON data")
		}

		assert.Equal(t, 1, len(data.Items))
	})
}

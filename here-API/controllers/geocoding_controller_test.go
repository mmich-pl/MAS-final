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

func TestGetRouting(t *testing.T) {
	testCase := struct {
		name string
		api  func(t *testing.T) *mocks.MockHereAPI
	}{
		name: "Geocoding - valid json",
		api: func(t *testing.T) *mocks.MockHereAPI {
			a := mocks.NewMockHereAPI(t)
			content := `{"routes":[{"id":"231dc3ef-cc57-4c7b-a45c-7cee127ca176","sections":[{"id":"46c52a61-9683-46f1-9697-ad0ea3e6d706","type":"vehicle","departure":{"time":"2020-09-14T11:14:37+02:00","place":{"type":"place","location":{"lat":52.513748,"lng":13.424624},"originalLocation":{"lat":52.51375,"lng":13.42462}}},"arrival":{"time":"2020-09-14T11:17:56+02:00","place":{"type":"place","location":{"lat":52.5178863,"lng":13.4341791},"originalLocation":{"lat":52.5178709,"lng":13.4341749},"waypoint":0}},"summary":{"duration":199,"length":1886,"baseDuration":199},"polyline":"BGo9llkDg_rzZkF0G8LoQ4NoQgP8QoLgKgyB0tB4XoVoLsJ0K4IwWoQsOsJ8LwHoLoGkS0KkN8GsJ0F8GgF4D4DsE0FwHoLUgK8BkIkDkI7B0eTgUT0KjDkhBvCoa7BsT3DwgBvCoVnGg8BjNg4D3D8zB_EsxBjDwgBzFs2BrEgyBvC8V7G8uB7G4wBnBwMkI8BoBnLgP_hEgKz1CsE_nBsJrjD4E1tB","transport":{"mode":"car"}},{"id":"f057e6ba-8ef9-4efe-b6ca-935159b16c3c","type":"vehicle","departure":{"time":"2020-09-14T11:17:56+02:00","place":{"type":"place","location":{"lat":52.5178863,"lng":13.4341791},"originalLocation":{"lat":52.5178709,"lng":13.4341749},"waypoint":0}},"arrival":{"time":"2020-09-14T11:19:46+02:00","place":{"type":"place","location":{"lat":52.5242323,"lng":13.4301462},"originalLocation":{"lat":52.52426,"lng":13.43},"waypoint":1}},"summary":{"duration":110,"length":1011,"baseDuration":110},"polyline":"BG8_tlkDm0-zZchI8BrTgFrxBkNvkEoGv5BkD7QgF_O0P7fsE_EkD7GoLUgFoB0F8B8Q0FsE8BkmBkSgtBwWkS8GwH8B8GoBosCgKkhBsE0FU0FUgZjD8VgKoGkD4F8C","transport":{"mode":"car"}},{"id":"c05c39b2-36bf-4360-9651-b67dee7acbc6","type":"vehicle","departure":{"time":"2020-09-14T11:19:46+02:00","place":{"type":"place","location":{"lat":52.5242323,"lng":13.4301462},"originalLocation":{"lat":52.52426,"lng":13.43},"waypoint":1}},"arrival":{"time":"2020-09-14T11:20:19+02:00","place":{"type":"place","location":{"lat":52.5232227,"lng":13.4280044},"originalLocation":{"lat":52.5233199,"lng":13.428}}},"summary":{"duration":33,"length":222,"baseDuration":33},"polyline":"BGws6lkDk42zZ3F7CnGjD7V_JrEzF3DjDzK_EvHrE7BjhBTzoBN_Z","transport":{"mode":"car"}}]}]}`
			responseBody := io.NopCloser(bytes.NewReader([]byte(content)))

			a.EXPECT().Route().Return(
				&http.Response{
					Body: responseBody,
				}, nil)
			return a
		},
	}
	t.Run(testCase.name, func(t *testing.T) {
		api := testCase.api(t)
		response, _ := api.Route()
		respBody, _ := io.ReadAll(response.Body)
		type Data struct {
			Items []models.Route `json:"routes"`
		}

		var data Data
		err := json.Unmarshal(respBody, &data)
		if err != nil {
			log.Fatal(err)
		}

		if len(data.Items) > 0 {
			section1 := data.Items[0]
			fmt.Println(section1)
		} else {
			fmt.Println("No items found in the JSON data")
		}

		assert.Equal(t, 1, len(data.Items))
	})
}

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
			log.Fatal(err)
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

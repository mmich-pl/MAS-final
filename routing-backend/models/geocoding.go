package models

import (
	"fmt"
	"github.com/goccy/go-json"
	"math"
)

type AddressRequest struct {
	Street     string `json:"street,omitempty"`
	PostalCode string `json:"postalCode,omitempty"`
	City       string `json:"city,omitempty"`
	County     string `json:"county,omitempty"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

func (l *Location) UnmarshalJSON(data []byte) error {

	round := func(num float64) int {
		return int(num + math.Copysign(0.5, num))
	}

	toFixed := func(num float64, precision int) float64 {
		output := math.Pow(10, float64(precision))
		return float64(round(num*output)) / output
	}

	aux := &struct {
		Lat float64 `json:"lat"`
		Lng float64 `json:"lng"`
	}{}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	l.Lat = toFixed(aux.Lat, 3)
	l.Lng = toFixed(aux.Lng, 3)

	return nil
}

type Geocoding struct {
	Address struct {
		City        string `json:"city"`
		HouseNumber string `json:"houseNumber"`
		PostalCode  string `json:"postalCode"`
		State       string `json:"state"`
		Street      string `json:"street"`
		Country     string `json:"countryName"`
	} `json:"address"`

	Location Location `json:"position"`
}

func (g Geocoding) MarshalJSON() ([]byte, error) {
	flattened := map[string]interface{}{
		"city":       g.Address.City,
		"postalCode": g.Address.PostalCode,
		"state":      g.Address.State,
		"street":     fmt.Sprintf("%s %s", g.Address.Street, g.Address.HouseNumber),
		"country":    g.Address.Country,
		"latitude":   g.Location.Lat,
		"longitude":  g.Location.Lng,
	}
	return json.Marshal(flattened)
}

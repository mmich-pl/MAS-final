package models

import (
	"github.com/goccy/go-json"
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
		"city":        g.Address.City,
		"houseNumber": g.Address.HouseNumber,
		"postalCode":  g.Address.PostalCode,
		"state":       g.Address.State,
		"street":      g.Address.Street,
		"countryName": g.Address.Country,
		"latitude":    g.Location.Lat,
		"longitude":   g.Location.Lng,
	}
	return json.Marshal(flattened)
}

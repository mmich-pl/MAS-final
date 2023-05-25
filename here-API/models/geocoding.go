package models

type Address struct {
	State       string `json:"state"`
	County      string `json:"county"`
	City        string `json:"city"`
	Street      string `json:"street"`
	PostalCode  string `json:"postalCode"`
	HouseNumber string `json:"houseNumber"`
}

type AddressRequest struct {
	Street     string `json:"street"`
	PostalCode string `json:"postalCode"`
	City       string `json:"city"`
	County     string `json:"county"`
}

type Position struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Geocoding struct {
	Id       string   `json:"id"`
	Address  Address  `json:"address"`
	Position Position `json:"position"`
}

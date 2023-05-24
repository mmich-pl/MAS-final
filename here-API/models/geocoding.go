package models

type Address struct {
	State       string `json:"state"`
	County      string `json:"county"`
	City        string `json:"city"`
	Street      string `json:"street"`
	PostalCode  string `json:"postalCode"`
	HouseNumber string `json:"houseNumber"`
}

type Position struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type MapView struct {
	West  float64 `json:"west"`
	South float64 `json:"south"`
	East  float64 `json:"east"`
	North float64 `json:"north"`
}

type Geocoding struct {
	Id       string   `json:"id"`
	Address  Address  `json:"address"`
	Position Position `json:"position"`
	MapView  MapView  `json:"mapView"`
}

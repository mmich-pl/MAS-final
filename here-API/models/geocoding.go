package models

type AddressRequest struct {
	Street     string `json:"street"`
	PostalCode string `json:"postalCode"`
	City       string `json:"city"`
	County     string `json:"county"`
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
	} `json:"address"`

	Location Location `json:"position"`
}

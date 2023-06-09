package mocks

import "net/http"

//go:generate mockery --name HereAPI
type HereAPI interface {
	Geocode() (*http.Response, error)
	Route() (*http.Response, error)
}

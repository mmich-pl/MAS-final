package models

import "time"

type RouteRequest struct {
	Origin        [2]float64   `json:"origin"`
	TransportMode string       `json:"transportMode"`
	Destination   [2]float64   `json:"destination"`
	Via           [][2]float64 `json:"via,omitempty"`
	GrossWeight   int64        `json:"grossWeight"`
	Height        int64        `json:"height"`
	DepartureTime time.Time    `json:"departureTime,omitempty"`
	ArrivalTime   time.Time    `json:"arrivalTime,omitempty"`
}

type Waypoint struct {
	Place struct {
		Type     string   `json:"type"`
		Location Location `json:"location"`
		Waypoint int      `json:"waypoint,omitempty"`
	} `json:"place"`
}

type Route struct {
	Sections []struct {
		Type      string   `json:"type"`
		Departure Waypoint `json:"departure"`
		Arrival   Waypoint `json:"arrival"`
		Polyline  string   `json:"polyline"`
	} `json:"sections"`
}

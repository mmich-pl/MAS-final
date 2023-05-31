package models

import "time"

type RouteRequest struct {
	Origin        [2]float64   `json:"origin"`
	TransportMode string       `json:"transportMode"`
	Destination   [2]float64   `json:"destination"`
	Via           [][2]float64 `json:"via,omitempty"`
	DepartureTime time.Time    `json:"departureTime,omitempty"`
	ArrivalTime   time.Time    `json:"arrivalTime,omitempty"`
}

type Waypoint struct {
	Place struct {
		Location Location `json:"location"`
		Waypoint int      `json:"waypoint,omitempty"`
	} `json:"place"`
}

type Route struct {
	Origin      *Location `json:"-"`
	Destination *Location `json:"-"`
	Sections    []struct {
		Departure *Waypoint `json:"departure"`
		Arrival   *Waypoint `json:"arrival"`
		Polyline  string    `json:"polyline"`
		Summary   *struct {
			Duration int `json:"duration"`
			Length   int `json:"length"`
		} `json:"summary"`
	} `json:"sections"`
}

package client

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
	"here-API/config"
	"here-API/errors"
	"here-API/models"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"
)

type Client struct {
	client *http.Client
	key    string
}

func NewProxyClient() *Client {
	proxyUrl, _ := url.Parse("http://127.0.0.1:8900")
	client := &http.Client{Transport: &http.Transport{
		Proxy:           http.ProxyURL(proxyUrl),
		TLSClientConfig: createTLSConfig()},
	}

	return &Client{
		client: client,
		key:    config.EnvGetValue("API_KEY"),
	}
}

func NewClient() *Client {
	return &Client{
		client: &http.Client{},
		key:    config.EnvGetValue("API_KEY"),
	}
}

func UnmarshalJson(target interface{}, r []byte) error {
	return json.Unmarshal(r, target)
}

func createTLSConfig() *tls.Config {
	insecure := flag.Bool("insecure-ssl", false, "Accept/Ignore all server SSL certificates")
	flag.Parse()

	rootCAs, _ := x509.SystemCertPool()
	if rootCAs == nil {
		rootCAs = x509.NewCertPool()
	}

	cert := os.Getenv("CERTIFICATE_PATH")
	certs, err := os.ReadFile(cert)
	if err != nil {
		log.Fatalf("Failed to append %q to RootCAs: %v", cert, err)
	}

	if ok := rootCAs.AppendCertsFromPEM(certs); !ok {
		log.Println("No certs appended, using system certs only")
	}

	return &tls.Config{
		InsecureSkipVerify: *insecure,
		RootCAs:            rootCAs,
	}
}

func (c *Client) AddRoutingParams(q *url.Values, route *models.RouteRequest) {
	q.Add("apiKey", c.key)
	q.Add("origin", fmt.Sprintf("%f,%f", route.Origin[0], route.Origin[1]))
	q.Add("destination", fmt.Sprintf("%f,%f", route.Destination[0], route.Destination[1]))
	q.Add("return", "polyline,summary")
	q.Add("transportMode", "truck")
	for _, point := range route.Via {
		q.Add("via", fmt.Sprintf("%f,%f", point[0], point[1]))
	}

	if !route.DepartureTime.IsZero() {
		q.Add("departureTime", route.DepartureTime.Format(time.RFC3339))
	}
	if !route.ArrivalTime.IsZero() {
		q.Add("departureTime", route.DepartureTime.Format(time.RFC3339))
	}
}

func (c *Client) AddGeocodingParams(q *url.Values, address *models.AddressRequest) {
	q.Add("apiKey", c.key)
	q.Add("q", fmt.Sprintf("%s, %s %s, %s",
		address.Street, address.PostalCode, address.City, address.County))
}

func (c *Client) Get(request *http.Request) (*http.Response, errors.ApiError) {

	resp, err := c.client.Do(request)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}

	switch resp.StatusCode {
	case http.StatusOK:
		return resp, nil
	case http.StatusBadRequest:
		return nil, errors.NewBadRequest(fmt.Sprintf("request failed"))
	case http.StatusNotFound:
		return nil, errors.NewNotFoundError("required resource was not found")
	default:
		return nil, errors.NewApiError(resp.StatusCode, "error occured")
	}
}

func (c *Client) GetDataFromBody(resp *http.Response, target interface{}) errors.ApiError {
	respBody, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		return errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}
	if err = UnmarshalJson(target, respBody); err != nil {
		return errors.NewInternalServerError(fmt.Sprintf("%v", err))

	}
	return nil
}

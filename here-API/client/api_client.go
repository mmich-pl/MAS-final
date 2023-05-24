package client

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
	"here-API/config"
	"here-API/errors"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

func UnmarshalJson(target interface{}, r []byte) error {
	return json.Unmarshal(r, target)
}

func CreateTLSConfig() *tls.Config {
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

func Get(apiUrl string, params map[string]string) (*http.Response, errors.ApiError) {
	proxyUrl, _ := url.Parse("http://127.0.0.1:8900")
	client := &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyUrl), TLSClientConfig: CreateTLSConfig()}}

	request, err := http.NewRequest(http.MethodGet, apiUrl, nil)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}

	q := request.URL.Query()
	for k, v := range params {
		q.Add(k, v)
	}
	q.Add("apiKey", config.EnvGetValue("API_KEY"))
	request.URL.RawQuery = q.Encode()

	resp, err := client.Do(request)
	if err != nil {
		return nil, errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}

	switch resp.StatusCode {
	case http.StatusOK:
		return resp, nil
	case http.StatusBadRequest:
		return nil, errors.NewBadRequest(fmt.Sprintf("request to %s failed", apiUrl))
	case http.StatusNotFound:
		return nil, errors.NewNotFoundError("required resource was not found")
	default:
		return nil, errors.NewApiError(resp.StatusCode, "error occured")
	}
}

func GetDataFromBody(resp *http.Response, target interface{}) errors.ApiError {
	respBody, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		return errors.NewInternalServerError(fmt.Sprintf("%v", err))
	}
	log.Print(respBody)
	if err = UnmarshalJson(target, respBody); err != nil {
		return errors.NewInternalServerError(fmt.Sprintf("%v", err))

	}
	return nil
}

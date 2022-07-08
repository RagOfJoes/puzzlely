package api

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
)

func getBits(provider, url, clientID, clientSecret, bearerToken string) ([]byte, error) {
	timeout := time.Duration(10 * time.Second)
	client := http.Client{
		Timeout: timeout,
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s?client_id=%s&client_secret=%s", url, clientID, clientSecret), nil)
	req.Header.Set("Authorization", bearerToken)
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "Failed to create request to %s", url)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%s responded with %s.", provider, err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "Failed read body.")
	}

	return body, nil
}

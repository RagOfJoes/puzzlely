package api

import (
	"net/http"

	"github.com/go-chi/render"
)

type Response struct {
	status int `json:"-"`

	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Payload interface{} `json:"payload,omitempty"`
	Error   error       `json:"error,omitempty"`
}

func (r *Response) Render(w http.ResponseWriter, req *http.Request) error {
	render.Status(req, r.status)
	return nil
}

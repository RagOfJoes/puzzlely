package handlers

import (
	"net/http"

	"github.com/go-chi/render"
)

var _ render.Renderer = (*Response)(nil)

// Response defines the structure in which clients will receive their data
type Response struct {
	status int `json:"-"`

	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Payload any    `json:"payload,omitempty"`
	Error   error  `json:"error,omitempty"`
}

func (r *Response) Render(w http.ResponseWriter, req *http.Request) error {
	render.Status(req, r.status)
	return nil
}

// Ok creates a response with a HTTP 200 status
func Ok(msg string, payload any) render.Renderer {
	return &Response{
		status: http.StatusOK,

		Success: true,
		Message: msg,
		Payload: payload,
	}
}

// Created creates a response with a HTTP 201 status
func Created(msg string, payload any) render.Renderer {
	return &Response{
		status: http.StatusCreated,

		Success: true,
		Message: msg,
		Payload: payload,
	}
}

// NoContent creates a response with a HTTP 204 status
func NoContent(msg string, payload any) render.Renderer {
	return &Response{
		status: http.StatusNoContent,

		Success: true,
		Message: msg,
		Payload: payload,
	}
}

// BadRequest creates a response with a HTTP 400 status
func BadRequest(err error) render.Renderer {
	return &Response{
		status: http.StatusBadRequest,

		Success: false,
		Error:   err,
	}
}

// Unauthorized creates a response with a HTTP 401 status
func Unauthorized(err error) render.Renderer {
	return &Response{
		status: http.StatusUnauthorized,

		Success: false,
		Error:   err,
	}
}

// Forbidden creates a response with a HTTP 403 status
func Forbidden(err error) render.Renderer {
	return &Response{
		status: http.StatusForbidden,

		Success: false,
		Error:   err,
	}
}

// NotFound creates a response with a HTTP 404 status
func NotFound(err error) render.Renderer {
	return &Response{
		status: http.StatusNotFound,

		Success: false,
		Error:   err,
	}
}

// MethodNotAllowed creates a response with a HTTP 405 status
func MethodNotAllowed(err error) render.Renderer {
	return &Response{
		status: http.StatusMethodNotAllowed,

		Success: false,
		Error:   err,
	}
}

// InternalServerError creates a response with a HTTP 500 status
func InternalServerError(err error) render.Renderer {
	return &Response{
		status: http.StatusInternalServerError,

		Success: false,
		Error:   err,
	}
}

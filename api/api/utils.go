package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/render"
)

// Success
//

func Ok(msg string, payload interface{}) render.Renderer {
	return &Response{
		status: http.StatusOK,

		Success: true,
		Message: msg,
		Payload: payload,
	}
}

func Created(msg string, payload interface{}) render.Renderer {
	return &Response{
		status: http.StatusCreated,

		Success: true,
		Message: msg,
		Payload: payload,
	}
}

// Errors
//

func BadRequest(err error) render.Renderer {
	return &Response{
		status: http.StatusBadRequest,

		Success: false,
		Error:   err,
	}
}

func Unauthorized(err error) render.Renderer {
	return &Response{
		status: http.StatusUnauthorized,

		Success: false,
		Error:   err,
	}
}

func Forbidden(err error) render.Renderer {
	return &Response{
		status: http.StatusForbidden,

		Success: false,
		Error:   err,
	}
}

func NotFound(err error) render.Renderer {
	return &Response{
		status: http.StatusNotFound,

		Success: false,
		Error:   err,
	}
}

func MethodNotAllowed(err error) render.Renderer {
	return &Response{
		status: http.StatusMethodNotAllowed,

		Success: false,
		Error:   err,
	}
}

func InternalServerError(err error) render.Renderer {
	return &Response{
		status: http.StatusInternalServerError,

		Success: false,
		Error:   err,
	}
}

// Private
//

// Resolves address provided by http server
// configuration
func resolveAddr(host string, port int) string {
	if port == 80 {
		return host
	}
	if host == ":" {
		return fmt.Sprintf("%s%d", host, port)
	}
	return fmt.Sprintf("%s:%d", host, port)
}

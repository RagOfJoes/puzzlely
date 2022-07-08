package internal

import (
	"fmt"
	"net/http"

	"github.com/go-chi/render"
)

type ErrorCode string

const (
	ErrorCodeInternal         ErrorCode = "Internal"
	ErrorCodeNotFound         ErrorCode = "NotFound"
	ErrorCodeForbidden        ErrorCode = "Forbidden"
	ErrorCodeBadRequest       ErrorCode = "BadRequest"
	ErrorCodeUnauthorized     ErrorCode = "Unauthorized"
	ErrorCodeMethodNotAllowed ErrorCode = "MethodNotAllowed"
)

type Error struct {
	err error `json:"-"`

	Code    ErrorCode `json:"code"`
	Message string    `json:"message"`
}

// Wraps error
func WrapErrorf(src error, code ErrorCode, msg string, args ...interface{}) error {
	return &Error{
		err: src,

		Code:    code,
		Message: fmt.Sprintf(msg, args...),
	}
}

// NewErrorf instantiates a new error
func NewErrorf(code ErrorCode, msg string, a ...interface{}) error {
	return WrapErrorf(nil, code, msg, a...)
}

// Error returns the message, when wrapping errors the wrapped error is returned
func (e *Error) Error() string {
	return e.Message
}

// Unwrap returns the wrapped error, if any
func (e *Error) Unwrap() error {
	return e.err
}

func (e *Error) Render(w http.ResponseWriter, r *http.Request) error {
	switch e.Code {
	case ErrorCodeBadRequest:
		render.Status(r, http.StatusBadRequest)
	case ErrorCodeUnauthorized:
		render.Status(r, http.StatusUnauthorized)
	case ErrorCodeForbidden:
		render.Status(r, http.StatusForbidden)
	case ErrorCodeNotFound:
		render.Status(r, http.StatusNotFound)
	case ErrorCodeMethodNotAllowed:
		render.Status(r, http.StatusMethodNotAllowed)
	default:
		render.Status(r, http.StatusInternalServerError)
	}
	return nil
}

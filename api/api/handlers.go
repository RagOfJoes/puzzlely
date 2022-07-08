package api

import (
	"errors"
	"net/http"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

var (
	// Custom method not allowed handler
	methodNotAllowed = func(w http.ResponseWriter, r *http.Request) {
		render.Render(w, r, MethodNotAllowed(internal.NewErrorf(internal.ErrorCodeMethodNotAllowed, "Server knows the request method, but the target doesn't support this method.")))
	}
	// Custom not found handler
	notFound = func(w http.ResponseWriter, r *http.Request) {
		render.Render(w, r, NotFound(internal.NewErrorf(internal.ErrorCodeNotFound, "Hmmm... Seems you're a bit lost.")))
	}
	// Custom respond handler
	respond = func(w http.ResponseWriter, r *http.Request, v interface{}) {
		var err *internal.Error
		if e, ok := v.(error); ok {
			defaultErr := InternalServerError(internal.WrapErrorf(e, internal.ErrorCodeInternal, "Oops! Something went wrong. Please try again later."))

			if errors.As(e, &err) {
				logrus.Debugf("Actual error: %+v", errors.Unwrap(err))

				switch err.Code {
				case internal.ErrorCodeBadRequest:
					render.Render(w, r, BadRequest(err))
				case internal.ErrorCodeUnauthorized:
					render.Render(w, r, Unauthorized(err))
				case internal.ErrorCodeForbidden:
					render.Render(w, r, Forbidden(err))
				case internal.ErrorCodeNotFound:
					render.Render(w, r, NotFound(err))
				case internal.ErrorCodeMethodNotAllowed:
					render.Render(w, r, MethodNotAllowed(err))
				default:
					render.Render(w, r, defaultErr)
				}
				return
			}
			render.Render(w, r, defaultErr)
			return
		}
		render.DefaultResponder(w, r, v)
	}
)

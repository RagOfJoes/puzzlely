package handlers

import (
	"errors"
	"net/http"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

var (
	ErrUserInvalidUpdatePayload = errors.New("Invalid update provided.")
)

type user struct {
	service services.User
	session session
}

type UserDependencies struct {
	Service services.User

	Session session
}

func User(dependencies UserDependencies, router *chi.Mux) {
	u := &user{
		service: dependencies.Service,
		session: dependencies.Session,
	}

	router.Get("/me", u.me)
	router.Route("/users", func(r chi.Router) {
		r.Get("/{id}", u.get)

		r.Put("/", u.update)
	})
}

func (u *user) get(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	id, err := ulid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrInvalidID)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrInvalidID))
		return
	}

	u.session.Get(w, r, false)

	user, err := u.service.Find(r.Context(), id.String(), false)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", user))
}

func (u *user) me(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	session, err := u.session.Get(w, r, true)
	if err != nil {
		span.SetStatus(codes.Error, "")

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	render.Render(w, r, Ok("", session))
}

func (u *user) update(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	var payload domains.UserUpdatePayload
	if err := render.Bind(r, &payload); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrUserInvalidUpdatePayload))
		return
	}
	if err := payload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err))
		return
	}

	session, err := u.session.Get(w, r, true)
	if err != nil {
		span.SetStatus(codes.Error, "")

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	// If no changes were made
	if session.User.IsComplete() && payload.Username == session.User.Username {
		render.Render(w, r, Ok("", session.User))
		return
	}

	update := *session.User
	update.Username = payload.Username

	user, err := u.service.Update(r.Context(), update)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", user))
}

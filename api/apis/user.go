package apis

import (
	"net/http"
	"strings"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/payloads"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

type user struct {
	config  config.Configuration
	service services.User
	session session
}

// User registers user endpoints and handlers to router
func User(cfg config.Configuration, service services.User, session session, router *chi.Mux) {
	u := user{
		config:  cfg,
		service: service,
		session: session,
	}

	router.Get("/me", u.me)
	router.Route("/users", func(r chi.Router) {
		// Read
		r.Get("/{search}", u.get)
		r.Get("/stats/{id}", u.getStats)
		// Update
		r.Post("/update", u.update)
		// Delete
		r.Delete("/delete", u.delete)
	})
}

func (u *user) get(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	search := chi.URLParam(r, "search")
	found, err := u.service.Find(ctx, search, true)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", found))
}

func (u *user) getStats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "Invalid id provided."))
		return
	}

	user, err := u.service.FindStats(ctx, userID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", user))
}

func (u *user) me(w http.ResponseWriter, r *http.Request) {
	session, err := u.session.Get(w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	render.Render(w, r, Ok("", session))
}

func (u *user) update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload payloads.UpdateUser
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "Invalid username provided."))
		return
	}
	if err := payload.Validate(); err != nil {
		render.Respond(w, r, err)
		return
	}

	session, err := u.session.Get(w, r, true)
	if err != nil || session == nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	if strings.EqualFold(payload.Username, session.User.Username) {
		render.Render(w, r, Ok("", session.User))
		return
	}

	updateUser := *session.User
	updateUser.Username = payload.Username
	user, err := u.service.Update(ctx, updateUser)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", user))
}

func (u *user) delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	session, err := u.session.Get(w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	if err := u.service.Delete(ctx, session.User.ID); err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", nil))
}

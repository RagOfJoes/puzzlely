package handlers

import (
	"net/http"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/oklog/ulid/v2"
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
	})
}

func (u *user) get(w http.ResponseWriter, r *http.Request) {
	userID, err := ulid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrInvalidID))
		return
	}

	u.session.Get(w, r, false)

	user, err := u.service.Find(r.Context(), userID.String(), false)
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

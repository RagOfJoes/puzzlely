package api

import (
	"net/http"
	"strings"

	"github.com/RagOfJoes/puzzlely/api"
	"github.com/RagOfJoes/puzzlely/auth"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

func (a *API) me(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	render.Render(w, r, api.Ok("", sess))
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	search := chi.URLParam(r, "search")
	found, err := a.UseCase.Find(ctx, search, true)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", found))
}

func (a *API) getStats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	userID, err := uuid.Parse(id)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist))
		return
	}

	found, err := a.UseCase.FindStats(ctx, userID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", found))
}

func (a *API) update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload := UpdateUserPayload{}
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", user.ErrInvalidUsername))
		return
	}
	if err := payload.Validate(); err != nil {
		render.Respond(w, r, err)
		return
	}

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil || sess == nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	if strings.EqualFold(payload.Username, sess.User.Username) {
		render.Render(w, r, api.Ok("", *sess.User))
		return
	}

	update := *sess.User
	update.Username = payload.Username
	updated, err := a.UseCase.Update(ctx, update)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", updated))
}

func (a *API) delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	if err := a.UseCase.Delete(ctx, sess.User.ID); err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", nil))
}

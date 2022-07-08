package api

import (
	"net/http"
	"strconv"

	"github.com/RagOfJoes/puzzlely/api"
	"github.com/RagOfJoes/puzzlely/auth"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/session"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

func (a *API) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload CreatePuzzlePayload
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidPayload))
		return
	}
	if err := payload.Validate(); err != nil {
		render.Respond(w, r, err)
		return
	}

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	newPuzzle := payload.ToEntity()
	newPuzzle.CreatedBy = *sess.User
	if err := validate.Check(newPuzzle); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedCreate))
		return
	}

	created, err := a.UseCase.New(ctx, newPuzzle)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedCreate))
		return
	}
	if err := validate.Check(created); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedCreate))
		return
	}

	render.Render(w, r, api.Created("", created))
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	puzzleID := chi.URLParam(r, "id")
	if _, err := uuid.Parse(puzzleID); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", puzzle.ErrNotFound))
		return
	}

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	retrieved, err := a.UseCase.Find(ctx, true, puzzleID, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", retrieved))
}

func (a *API) getCreated(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	cursor := r.URL.Query().Get("cursor")
	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", pagination.ErrInvalidLimit))
		return
	}
	params := pagination.Params{
		Cursor:    cursor,
		SortKey:   "created_at",
		SortOrder: "DESC",
		Limit:     limit,
	}

	search := chi.URLParam(r, "search")
	user, err := a.UserUseCase.Find(ctx, search, true)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	conn, err := a.UseCase.FindCreated(ctx, params, *user, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", conn))
}

func (a *API) getLiked(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	cursor := r.URL.Query().Get("cursor")
	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", pagination.ErrInvalidLimit))
		return
	}
	params := pagination.Params{
		Cursor:    cursor,
		SortKey:   "liked_at",
		SortOrder: "DESC",
		Limit:     limit,
	}

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	conn, err := a.UseCase.FindLiked(ctx, params, *sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", conn))
}

func (a *API) getMostLiked(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	conn, err := a.UseCase.FindMostLiked(ctx, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", conn))
}

func (a *API) getMostPlayed(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	conn, err := a.UseCase.FindMostPlayed(ctx, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", conn))
}

func (a *API) getRecent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	cursor := r.URL.Query().Get("cursor")
	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", pagination.ErrInvalidLimit))
		return
	}
	params := pagination.Params{
		Cursor:    cursor,
		SortKey:   "created_at",
		SortOrder: "DESC",
		Limit:     limit,
	}

	filters, err := getFilters(r)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidFilter))
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	conn, err := a.UseCase.FindRecent(ctx, params, *filters, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", conn))
}

func (a *API) search(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	term := r.URL.Query().Get("term")
	if err := validate.Var(term, "required,notblank,alphanumspace,min=1,max=64"); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", puzzle.ErrInvalidSearch))
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	conn, err := a.UseCase.Search(ctx, term, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", conn))
}

func (a *API) toggleLike(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	param := chi.URLParam(r, "id")
	puzzleID, err := uuid.Parse(param)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidID))
		return
	}

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	toggled, err := a.UseCase.ToggleLike(ctx, puzzleID, *sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", toggled))
}

func (a *API) update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	puzzleID := chi.URLParam(r, "id")
	if _, err := uuid.Parse(puzzleID); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidID))
		return
	}

	var payload UpdatePuzzlePayload
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidPayload))
		return
	}
	if err := payload.Validate(); err != nil {
		render.Respond(w, r, err)
		return
	}

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	found, err := a.UseCase.Find(ctx, true, puzzleID, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	update := payload.ToEntity(*found)

	updated, err := a.UseCase.Update(ctx, *found, update, *sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", updated))
}

func (a *API) delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	puzzleID, err := uuid.Parse(id)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidID))
		return
	}

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	if err := a.UseCase.Delete(ctx, puzzleID, *sess.User); err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", nil))
}

package api

import (
	"net/http"
	"strconv"

	"github.com/RagOfJoes/puzzlely/api"
	"github.com/RagOfJoes/puzzlely/game"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/session"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

func (a *API) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	puzzleID := chi.URLParam(r, "id")
	_, err := uuid.Parse(puzzleID)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrInvalidPuzzle))
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	foundPuzzle, err := a.PuzzleUseCase.Find(ctx, false, puzzleID, sess.User)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrInvalidPuzzle))
		return
	}

	created, err := a.UseCase.New(ctx, *foundPuzzle, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Created("", created))
}

func (a *API) challenge(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	challengeCode := chi.URLParam(r, "challenge_code")

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	challenged, err := a.UseCase.Challenge(ctx, challengeCode, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Created("", challenged))
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	gameID, err := uuid.Parse(id)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrNotFound))
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	found, err := a.UseCase.Find(ctx, gameID, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", found))
}

func (a *API) getPlayed(w http.ResponseWriter, r *http.Request) {
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

	conn, err := a.UseCase.FindPlayed(ctx, params, *user, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, api.Ok("", conn))
}

func (a *API) complete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	gameID, err := uuid.Parse(id)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrNotFound))
		return
	}

	var payload UpdateGamePayload
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrInvalidUpdatePayload))
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	found, err := a.UseCase.Find(ctx, gameID, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	update := payload.toEntity(*found)
	if err := validate.Check(update); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrInvalidUpdatePayload))
		return
	}
	updated, err := a.UseCase.Complete(ctx, *found, update, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	response := UpdateGameResponse{
		ID:            updated.ID,
		Score:         updated.Score,
		Attempts:      updated.Attempts,
		Correct:       updated.Correct,
		Config:        updated.Config,
		Results:       updated.Results,
		ChallengeCode: updated.ChallengeCode,
		CreatedAt:     updated.CreatedAt,
		StartedAt:     updated.StartedAt,
		GuessedAt:     updated.GuessedAt,
		CompletedAt:   updated.CompletedAt,
	}
	if err := validate.Check(response); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrFailedUpdate))
		return
	}

	render.Render(w, r, api.Ok("", response))
}

func (a *API) guess(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	gameID, err := uuid.Parse(id)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrNotFound))
		return
	}

	var payload UpdateGamePayload
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrInvalidUpdatePayload))
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess == nil {
		sess = &session.Session{}
	}

	found, err := a.UseCase.Find(ctx, gameID, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	update := payload.toEntity(*found)
	if err := validate.Check(update); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrInvalidUpdatePayload))
		return
	}
	updated, err := a.UseCase.Guess(ctx, *found, update, sess.User)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	response := UpdateGameResponse{
		ID:            updated.ID,
		Score:         updated.Score,
		Attempts:      updated.Attempts,
		Correct:       updated.Correct,
		Config:        updated.Config,
		Results:       updated.Results,
		ChallengeCode: updated.ChallengeCode,
		CreatedAt:     updated.CreatedAt,
		StartedAt:     updated.StartedAt,
		GuessedAt:     updated.GuessedAt,
		CompletedAt:   updated.CompletedAt,
	}
	if err := validate.Check(response); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrFailedUpdate))
		return
	}

	render.Render(w, r, api.Ok("", response))
}

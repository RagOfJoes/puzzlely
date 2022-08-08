package apis

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/payloads"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

// Errors
var (
	ErrGameInvalidID     = errors.New("Invalid game id provided.")
	ErrGameInvalidUpdate = errors.New("Invalid update payload provided.")
	ErrGameUpdate        = errors.New("Failed to update game.")
)

type game struct {
	config  config.Configuration
	puzzle  services.Puzzle
	service services.Game
	session session
	user    services.User
}

func Game(cfg config.Configuration, puzzle services.Puzzle, service services.Game, session session, user services.User, router *chi.Mux) {
	g := game{
		config:  cfg,
		puzzle:  puzzle,
		service: service,
		session: session,
		user:    user,
	}

	router.Route("/games", func(r chi.Router) {
		// Create
		r.Put("/{id}", g.create)
		r.Put("/challenge/{challenge_code}", g.challenge)
		// Read
		r.Get("/{id}", g.get)
		r.Get("/played/{search}", g.getPlayed)
		// Update
		r.Post("/complete/{id}", g.complete)
		r.Post("/guess/{id}", g.guess)

	})
}

func (g *game) create(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleInvalidID))
		return
	}

	g.session.Get(w, r, false)

	ctx := r.Context()

	puzzle, err := g.puzzle.Find(ctx, puzzleID, false)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	game, err := g.service.New(ctx, *puzzle)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Created("", game))
}

func (g *game) challenge(w http.ResponseWriter, r *http.Request) {
	challengeCode := chi.URLParam(r, "challenge_code")

	g.session.Get(w, r, false)

	game, err := g.service.Challenge(r.Context(), challengeCode)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Created("", game))
}

func (g *game) get(w http.ResponseWriter, r *http.Request) {
	gameID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameInvalidID))
		return
	}

	g.session.Get(w, r, false)

	game, err := g.service.Find(r.Context(), gameID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", game))
}

func (g *game) getPlayed(w http.ResponseWriter, r *http.Request) {
	cursor := r.URL.Query().Get("cursor")
	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", pagination.ErrInvalidLimit))
		return
	}

	g.session.Get(w, r, false)

	ctx := r.Context()

	search := chi.URLParam(r, "search")
	user, err := g.user.Find(ctx, search, true)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	params := pagination.Params{
		Cursor:    cursor,
		SortKey:   "created_at",
		SortOrder: "DESC",
		Limit:     limit,
	}
	connection, err := g.service.FindPlayed(ctx, params, *user)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (g *game) complete(w http.ResponseWriter, r *http.Request) {
	gameID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameInvalidID))
		return
	}

	var payload payloads.UpdateGame
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameInvalidUpdate))
		return
	}

	g.session.Get(w, r, false)

	ctx := r.Context()

	oldGame, err := g.service.Find(ctx, gameID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	updateGame := payload.ToEntity(*oldGame)
	if err := validate.Check(updateGame); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameInvalidUpdate))
		return
	}

	game, err := g.service.Complete(ctx, *oldGame, updateGame)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	response := entities.GameResponse{
		ID:            game.ID,
		Score:         game.Score,
		Attempts:      game.Attempts,
		Correct:       game.Correct,
		Config:        game.Config,
		Results:       game.Results,
		ChallengeCode: game.ChallengeCode,
		CreatedAt:     game.CreatedAt,
		StartedAt:     game.StartedAt,
		GuessedAt:     game.GuessedAt,
		CompletedAt:   game.CompletedAt,
	}
	if err := validate.Check(response); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameUpdate))
		return
	}

	render.Render(w, r, Ok("", response))
}

func (g *game) guess(w http.ResponseWriter, r *http.Request) {
	gameID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameInvalidID))
		return
	}

	var payload payloads.UpdateGame
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameInvalidUpdate))
		return
	}

	g.session.Get(w, r, false)

	ctx := r.Context()

	oldGame, err := g.service.Find(ctx, gameID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	updateGame := payload.ToEntity(*oldGame)
	if err := validate.Check(updateGame); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameInvalidUpdate))
		return
	}

	game, err := g.service.Guess(ctx, *oldGame, updateGame)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	response := entities.GameResponse{
		ID:            game.ID,
		Score:         game.Score,
		Attempts:      game.Attempts,
		Correct:       game.Correct,
		Config:        game.Config,
		Results:       game.Results,
		ChallengeCode: game.ChallengeCode,
		CreatedAt:     game.CreatedAt,
		StartedAt:     game.StartedAt,
		GuessedAt:     game.GuessedAt,
		CompletedAt:   game.CompletedAt,
	}
	if err := validate.Check(response); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameUpdate))
		return
	}

	render.Render(w, r, Ok("", response))
}

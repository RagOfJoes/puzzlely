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
)

// Errors
var (
	ErrGameAlreadyExists = errors.New("Game already exists.")
)

type game struct {
	puzzle  services.Puzzle
	service services.Game
	user    services.User

	session session
}

type GameDependencies struct {
	Puzzle  services.Puzzle
	Service services.Game
	User    services.User

	Session session
}

func Game(dependencies GameDependencies, router *chi.Mux) {
	g := &game{
		puzzle:  dependencies.Puzzle,
		service: dependencies.Service,
		user:    dependencies.User,

		session: dependencies.Session,
	}

	router.Route("/games", func(r chi.Router) {
		r.Post("/{puzzle_id}", g.create)

		r.Get("/{puzzle_id}", g.get)
		r.Get("/history/{user_id}", g.history)
	})
}

func (g *game) create(w http.ResponseWriter, r *http.Request) {
	// First make sure that the request is valid
	puzzleID, err := ulid.Parse(chi.URLParam(r, "puzzle_id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	// Get the session from the request and pass result, if any, to the context
	g.session.Get(w, r, false)

	// Check if a game already exists for the puzzle and the user
	foundGame, err := g.service.FindByPuzzleID(r.Context(), puzzleID)
	if foundGame != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameAlreadyExists))
		return
	}

	// Find the foundPuzzle
	foundPuzzle, err := g.puzzle.Find(r.Context(), puzzleID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	// Create the game
	createdGame, err := g.service.Create(r.Context(), *foundPuzzle)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Created("", createdGame))
}

func (g *game) get(w http.ResponseWriter, r *http.Request) {
	// First make sure that the request is valid
	puzzleID, err := ulid.Parse(chi.URLParam(r, "puzzle_id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	// Get the session from the request and pass result, if any, to the context
	g.session.Get(w, r, false)

	// Check if a game already exists for the puzzle and the user
	game, err := g.service.FindByPuzzleID(r.Context(), puzzleID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", game))
}

func (g *game) history(w http.ResponseWriter, r *http.Request) {
	// First make sure that the request is valid
	userID, err := ulid.Parse(chi.URLParam(r, "user_id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	cursor, err := domains.CursorFromString(r.URL.Query().Get("cursor"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", domains.ErrCursorInvalid))
		return
	}

	// Get the session from the request and pass result, if any, to the context
	g.session.Get(w, r, false)

	foundUser, err := g.user.Find(r.Context(), userID.String(), false)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	foundGames, err := g.service.FindHistory(r.Context(), cursor, *foundUser)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", foundGames))
}

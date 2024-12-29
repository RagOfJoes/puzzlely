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
	ErrGameAlreadyExists  = errors.New("Game already exists.")
	ErrGameInvalidPayload = errors.New("Invalid game provided.")
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
		r.Get("/{puzzle_id}", g.get)
		r.Get("/history/{user_id}", g.history)

		r.Put("/{puzzle_id}", g.save)
	})
}

func (g *game) get(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := ulid.Parse(chi.URLParam(r, "puzzle_id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	if _, err := g.session.Get(w, r, true); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	game, err := g.service.FindByPuzzleID(r.Context(), puzzleID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", game))
}

func (g *game) history(w http.ResponseWriter, r *http.Request) {
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

	opts := domains.GameCursorPaginationOpts{
		Cursor: cursor,
		Limit:  30,
	}
	games, err := g.service.FindHistory(r.Context(), userID.String(), opts)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", games))
}

func (g *game) save(w http.ResponseWriter, r *http.Request) {
	var payload domains.GamePayload
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameInvalidPayload))
		return
	}
	if err := payload.Validate(); err != nil {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err))
		return
	}

	puzzleID, err := ulid.Parse(chi.URLParam(r, "puzzle_id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	session, err := g.session.Get(w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	puzzle, err := g.puzzle.Find(r.Context(), puzzleID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	// Create a new game
	newGame := domains.NewGame()
	// Append payload to game
	newGame.Score = payload.Score
	newGame.Attempts = payload.Attempts
	newGame.Correct = payload.Correct
	newGame.CompletedAt = payload.CompletedAt
	// Append puzzle
	newGame.PuzzleID = puzzle.ID
	newGame.Puzzle = *puzzle
	// Append user
	newGame.UserID = session.User.ID
	newGame.User = *session.User

	// Check if the user already has a game saved
	// - If not, save the given game
	// - If so, check if the saved game is ahead of the given game
	//    - If the saved game is ahead then just respond back with the saved game
	//    - Else, save the given game and then respond with it
	game, err := g.service.FindByPuzzleID(r.Context(), puzzleID)
	if err != nil || game == nil {
		savedGame, err := g.service.Save(r.Context(), newGame)
		if err != nil {
			render.Respond(w, r, err)
			return
		}

		render.Render(w, r, Created("", savedGame))
		return
	}

	if game.IsAhead(newGame) {
		render.Render(w, r, Ok("", game))
		return
	}

	savedGame, err := g.service.Save(r.Context(), newGame)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", savedGame))
}

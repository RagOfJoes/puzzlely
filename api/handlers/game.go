package handlers

import (
	"errors"
	"net/http"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

// Errors
var (
	ErrGameAlreadyExists  = errors.New("Game already exists.")
	ErrGameInvalidPayload = errors.New("Invalid game provided.")
)

type game struct {
	tracer trace.Tracer

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
		tracer: telemetry.Tracer("handlers.game"),

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
	span := trace.SpanFromContext(r.Context())

	id, err := ulid.Parse(chi.URLParam(r, "puzzle_id"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrInvalidID)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	if _, err := g.session.Get(w, r, true); err != nil {
		span.SetStatus(codes.Error, "")

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	game, err := g.service.FindByPuzzleID(r.Context(), id)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", game))
}

func (g *game) history(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	id, err := ulid.Parse(chi.URLParam(r, "user_id"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrInvalidID)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	cursor, err := domains.CursorFromString(r.URL.Query().Get("cursor"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", err))
		return
	}

	// Get the session from the request and pass result, if any, to the context
	g.session.Get(w, r, false)

	opts := domains.GameCursorPaginationOpts{
		Cursor: cursor,
		Limit:  12,
	}
	games, err := g.service.FindHistory(r.Context(), id.String(), opts)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", games))
}

func (g *game) save(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	var payload domains.GamePayload
	if err := render.Bind(r, &payload); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrGameInvalidPayload)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameInvalidPayload))
		return
	}
	if err := payload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrGameInvalidPayload)

		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidPayload))
		return
	}

	id, err := ulid.Parse(chi.URLParam(r, "puzzle_id"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrInvalidID)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	session, err := g.session.Get(w, r, true)
	if err != nil {
		span.SetStatus(codes.Error, "")

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	puzzle, err := g.puzzle.Find(r.Context(), id)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

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
	//    - If the saved game has already been completed, has been wrongfully updated, or, is ahead then just respond back with the saved game
	//    - Else, save the given game and then respond with it
	game, err := g.service.FindByPuzzleID(r.Context(), id)
	if err != nil || game == nil {
		saved, err := g.service.Save(r.Context(), newGame)
		if err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			render.Respond(w, r, err)
			return
		}

		render.Render(w, r, Created("", saved))
		return
	}

	if !game.CompletedAt.IsZero() || !game.IsContinuation(newGame) || game.IsAhead(newGame) {
		render.Render(w, r, Ok("", game))
		return
	}

	saved, err := g.service.Save(r.Context(), newGame)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", saved))
}

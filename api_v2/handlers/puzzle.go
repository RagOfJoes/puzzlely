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
	ErrPuzzleCursorPaginationOpts = errors.New("Invalid cursor pagination options provided.")
	ErrPuzzleInvalidCreatePayload = errors.New("Invalid new puzzle provided.")
)

type puzzle struct {
	service services.Puzzle

	session session
}

type PuzzleDependencies struct {
	Service services.Puzzle

	Session session
}

func Puzzle(dependencies PuzzleDependencies, router *chi.Mux) {
	p := &puzzle{
		service: dependencies.Service,

		session: dependencies.Session,
	}

	router.Route("/puzzles", func(r chi.Router) {
		// Create
		//

		r.Post("/create", p.create)

		// Read
		//

		r.Get("/{id}", p.puzzle)
		r.Get("/created/{user_id}", p.created)
		r.Get("/recent", p.recent)
	})
}

func (p *puzzle) create(w http.ResponseWriter, r *http.Request) {
	var payload domains.PuzzleCreatePayload
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidCreatePayload))
		return
	}
	if err := payload.Validate(); err != nil {
		render.Respond(w, r, err)
		return
	}

	session, err := p.session.Get(w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	newPuzzle := payload.ToPuzzle()
	newPuzzle.CreatedBy = *session.User
	newPuzzle.UserID = session.User.ID
	if err := newPuzzle.Validate(); err != nil {
		render.Respond(w, r, err)
		return
	}

	created, err := p.service.New(r.Context(), newPuzzle)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Created("", created))
}

func (p *puzzle) created(w http.ResponseWriter, r *http.Request) {
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
	p.session.Get(w, r, false)

	opts := domains.PuzzleCursorPaginationOpts{
		Cursor: cursor,
		Limit:  30,
	}
	connection, err := p.service.FindCreated(r.Context(), userID.String(), opts)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) puzzle(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := ulid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	puzzle, err := p.service.Find(r.Context(), puzzleID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", puzzle))
}

func (p *puzzle) recent(w http.ResponseWriter, r *http.Request) {
	cursor, err := domains.CursorFromString(r.URL.Query().Get("cursor"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", domains.ErrCursorInvalid))
		return
	}

	p.session.Get(w, r, false)

	opts := domains.PuzzleCursorPaginationOpts{
		Cursor:    cursor,
		Direction: r.URL.Query().Get("direction"),
		Limit:     1,
	}
	connection, err := p.service.FindRecent(r.Context(), opts)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

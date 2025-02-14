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
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

// Errors
var (
	ErrPuzzleCursorPaginationOpts = errors.New("Invalid cursor pagination options provided.")
	ErrPuzzleInvalidCreatePayload = errors.New("Invalid new puzzle provided.")
	ErrPuzzleInvalidUpdatePayload = errors.New("Invalid puzzle provided.")
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
		r.Post("/create", p.create)

		r.Get("/{id}", p.puzzle)
		r.Get("/created/{user_id}", p.created)
		r.Get("/liked/{user_id}", p.liked)
		r.Get("/recent", p.recent)

		r.Put("/like/{id}", p.toggleLike)
		r.Put("/update/{id}", p.create)
	})
}

func (p *puzzle) create(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	var payload domains.PuzzleCreatePayload
	if err := render.Bind(r, &payload); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrPuzzleInvalidCreatePayload)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidCreatePayload))
		return
	}
	if err := payload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrPuzzleInvalidCreatePayload)

		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidCreatePayload))
		return
	}

	session, err := p.session.Get(w, r, true)
	if err != nil {
		span.SetStatus(codes.Error, "")

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	newPuzzle := payload.ToPuzzle()
	newPuzzle.CreatedBy = *session.User
	newPuzzle.UserID = session.User.ID
	if err := newPuzzle.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrPuzzleInvalidCreatePayload)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidCreatePayload))
		return
	}

	puzzle, err := p.service.New(r.Context(), newPuzzle)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Created("", puzzle))
}

func (p *puzzle) created(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	// First make sure that the request is valid
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
	p.session.Get(w, r, false)

	opts := domains.PuzzleCursorPaginationOpts{
		Cursor: cursor,
		Limit:  12,
	}
	connection, err := p.service.FindCreated(r.Context(), id.String(), opts)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) liked(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	// First make sure that the request is valid
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
	p.session.Get(w, r, false)

	opts := domains.PuzzleCursorPaginationOpts{
		Cursor: cursor,
		Limit:  12,
	}
	connection, err := p.service.FindLiked(r.Context(), id.String(), opts)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) puzzle(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	id, err := ulid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrInvalidID)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	p.session.Get(w, r, false)

	puzzle, err := p.service.Find(r.Context(), id)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", puzzle))
}

func (p *puzzle) recent(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	cursor, err := domains.CursorFromString(r.URL.Query().Get("cursor"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", err))
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
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) toggleLike(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	id, err := ulid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrInvalidID)

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
		return
	}

	if _, err := p.session.Get(w, r, true); err != nil {
		span.SetStatus(codes.Error, "")

		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	like, err := p.service.ToggleLike(r.Context(), id)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", like))
}

// func (p *puzzle) update(w http.ResponseWriter, r *http.Request) {
// 	var payload domains.PuzzleUpdatePayload
// 	if err := render.Bind(r, &payload); err != nil {
// 		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidUpdatePayload))
// 		return
// 	}
// 	if err := payload.Validate(); err != nil {
// 		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err))
// 		return
// 	}
//
// 	id, err := ulid.Parse(chi.URLParam(r, "id"))
// 	if err != nil {
// 		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrInvalidID))
// 		return
// 	}
//
// 	if _, err := p.session.Get(w, r, true); err != nil {
// 		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
// 		return
// 	}
//
// 	puzzle, err := p.service.Find(r.Context(), id)
// 	if err != nil {
// 		render.Respond(w, r, err)
// 		return
// 	}
//
// 	if payload.Difficulty == puzzle.Difficulty && len(payload.Groups) == 0 {
// 		render.Render(w, r, Ok("", puzzle))
// 		return
// 	}
//
// 	update := *puzzle
// 	update.Difficulty = payload.Difficulty
//
// 	groups := map[string]domains.PuzzleUpdatePayloadGroup{}
// 	for _, group := range payload.Groups {
// 		groups[group.ID] = group
// 	}
//
// 	for i, group := range update.Groups {
// 		value, ok := groups[group.ID]
// 		if !ok {
// 			continue
// 		}
//
// 		update.Groups[i].Description = value.Description
// 	}
//
// 	updated, err := p.service.Update(r.Context(), *puzzle, update)
// 	if err != nil {
// 		render.Respond(w, r, err)
// 		return
// 	}
//
// 	render.Render(w, r, Ok("", updated))
// }

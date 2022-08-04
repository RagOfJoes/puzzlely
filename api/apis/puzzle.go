package apis

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

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
	ErrPuzzleInvalidFilters = errors.New("Invalid filters provided.")
	ErrPuzzleInvalidID      = errors.New("Invalid puzzle id provided.")
	ErrPuzzleInvalidPayload = errors.New("Invalid puzzle payload provided.")
)

type puzzle struct {
	config  config.Configuration
	service services.Puzzle
	session session
	user    services.User
}

func Puzzle(cfg config.Configuration, service services.Puzzle, session session, user services.User, router *chi.Mux) {
	p := puzzle{
		config:  cfg,
		service: service,
		session: session,
		user:    user,
	}

	router.Route("/puzzles", func(r chi.Router) {
		// Create
		r.Put("/", p.create)
		// Read
		r.Get("/{id}", p.get)
		r.Get("/created/{search}", p.getCreated)
		r.Get("/liked", p.getLiked)
		r.Get("/mostLiked", p.getMostLiked)
		// TODO: Implement this when game has been refactored
		// r.Get("/mostPlayed", p.getMostPlayed)
		r.Get("/recent", p.getRecent)
		r.Get("/search", p.search)
		// Update
		r.Post("/like/{id}", p.toggleLike)
		r.Post("/{id}", p.update)
		// Delete
		r.Delete("/{id}", p.delete)
	})
}

func (p *puzzle) create(w http.ResponseWriter, r *http.Request) {
	var payload payloads.CreatePuzzle
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidPayload))
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

	ctx := r.Context()

	createPuzzle := payload.ToEntity()
	createPuzzle.CreatedBy = *session.User
	if err := validate.Check(createPuzzle); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", err))
		return
	}

	puzzle, err := p.service.New(ctx, createPuzzle)
	if err != nil {
		render.Respond(w, r, err)
		return
	}
	if err := validate.Check(puzzle); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", err))
		return
	}

	render.Render(w, r, Created("", puzzle))
}

func (p *puzzle) get(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "Must provide valid ID."))
		return
	}

	if _, err := p.session.Get(w, r, true); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	ctx := r.Context()

	puzzle, err := p.service.Find(ctx, puzzleID, true)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", puzzle))
}

func (p *puzzle) getCreated(w http.ResponseWriter, r *http.Request) {
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
	user, err := p.user.Find(r.Context(), search, true)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	p.session.Get(w, r, false)

	connection, err := p.service.FindCreated(r.Context(), params, *user)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) getLiked(w http.ResponseWriter, r *http.Request) {
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

	if _, err := p.session.Get(w, r, true); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	connection, err := p.service.FindLiked(r.Context(), params)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) getMostLiked(w http.ResponseWriter, r *http.Request) {
	p.session.Get(w, r, false)

	connection, err := p.service.FindMostLiked(r.Context())
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) getRecent(w http.ResponseWriter, r *http.Request) {
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

	filters, err := getPuzzleFilters(r)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidFilters))
		return
	}

	p.session.Get(w, r, false)

	connection, err := p.service.FindRecent(r.Context(), params, *filters)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) search(w http.ResponseWriter, r *http.Request) {
	term := r.URL.Query().Get("term")
	if err := validate.CheckPartial(entities.Puzzle{Name: term}, "Name"); err != nil {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%s", strings.Replace(err.Error(), "name", "Search term", 1)))
		return
	}

	p.session.Get(w, r, false)

	connection, err := p.service.Search(r.Context(), term)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", connection))
}

func (p *puzzle) toggleLike(w http.ResponseWriter, r *http.Request) {
	param := chi.URLParam(r, "id")
	puzzleID, err := uuid.Parse(param)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidID))
		return
	}

	if _, err := p.session.Get(w, r, true); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	like, err := p.service.ToggleLike(r.Context(), puzzleID)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", like))
}

func (p *puzzle) update(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidID))
		return
	}

	var payload payloads.UpdatePuzzle
	if err := render.Bind(r, &payload); err != nil {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidPayload))
		return
	}
	if err := payload.Validate(); err != nil {
		render.Respond(w, r, err)
		return
	}

	if _, err := p.session.Get(w, r, true); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	ctx := r.Context()

	oldPuzzle, err := p.service.Find(ctx, puzzleID, true)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	updatePuzzle := payload.ToEntity(*oldPuzzle)

	puzzle, err := p.service.Update(ctx, *oldPuzzle, updatePuzzle)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", puzzle))
}

func (p *puzzle) delete(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidID))
		return
	}

	if _, err := p.session.Get(w, r, true); err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	ctx := r.Context()

	if err := p.service.Delete(ctx, puzzleID); err != nil {
		render.Respond(w, r, err)
		return
	}

	render.Render(w, r, Ok("", nil))
}

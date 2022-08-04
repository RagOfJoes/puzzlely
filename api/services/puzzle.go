package services

import (
	"context"
	"errors"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// Errors
var (
	ErrPuzzleCreate        = errors.New("Failed to create puzzle.")
	ErrPuzzleDelete        = errors.New("Failed to delete puzzle.")
	ErrPuzzleInvalid       = errors.New("Invalid puzzle.")
	ErrPuzzleLike          = errors.New("Failed to like puzzle.")
	ErrPuzzleList          = errors.New("Failed to fetch puzzles.")
	ErrPuzzleNotAuthorized = errors.New("Not authorized to access this puzzle's details.")
	ErrPuzzleNotFound      = errors.New("Puzzle not found.")
	ErrPuzzleUpdate        = errors.New("Failed to update puzzle.")
)

// Puzzle defines the puzzle service
type Puzzle struct {
	config     config.Configuration
	repository repositories.Puzzle
}

// NewPuzzle instantiates a puzzle service
func NewPuzzle(config config.Configuration, repository repositories.Puzzle) Puzzle {
	logrus.Print("Created Puzzle Service")

	return Puzzle{
		config:     config,
		repository: repository,
	}
}

// New creates a new puzzle
func (p *Puzzle) New(ctx context.Context, newPuzzle entities.Puzzle) (*entities.Puzzle, error) {
	if err := validate.Check(newPuzzle); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	puzzle, err := p.repository.Create(ctx, newPuzzle)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleCreate)
	}

	puzzle.CreatedBy = newPuzzle.CreatedBy
	if err := validate.Check(puzzle); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleCreate)
	}

	return puzzle, nil
}

// Find finds a puzzle. If strict is set to true only the puzzle that belongs to the current user will be returned
func (p *Puzzle) Find(ctx context.Context, id uuid.UUID, strict bool) (*entities.Puzzle, error) {
	user := entities.UserFromContext(ctx)
	if strict && user == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleNotAuthorized)
	}

	puzzle, err := p.repository.Get(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}
	if err := validate.Check(puzzle); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}
	if strict && puzzle.CreatedBy.ID != user.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleNotAuthorized)
	}

	return puzzle, nil
}

// FindCreated finds a list of puzzles that a user has created
func (p *Puzzle) FindCreated(ctx context.Context, params pagination.Params, user entities.User) (*entities.PuzzleConnection, error) {
	if err := params.Vally(entities.Puzzle{}); err != nil {
		return nil, err
	}
	params.Limit = params.Limit + 1

	nodes, err := p.repository.GetCreated(ctx, params, user.ID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := buildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindLiked finds a list of puzzles that the current user has liked
func (p *Puzzle) FindLiked(ctx context.Context, params pagination.Params) (*entities.PuzzleConnection, error) {
	if err := params.Vally(entities.Puzzle{}); err != nil {
		return nil, err
	}
	params.Limit = params.Limit + 1

	nodes, err := p.repository.GetLiked(ctx, params)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := buildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindMostLiked finds a list of most likes puzzles
func (p *Puzzle) FindMostLiked(ctx context.Context) (*entities.PuzzleConnection, error) {
	params := pagination.Params{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	nodes, err := p.repository.GetMostLiked(ctx, params)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := buildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindMostPlayed finds a list of most played puzzles
func (p *Puzzle) FindMostPlayed(ctx context.Context) (*entities.PuzzleConnection, error) {
	params := pagination.Params{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	nodes, err := p.repository.GetMostPlayed(ctx, params)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := buildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindRecent finds a list of puzzles sorted from newest to oldest and filtered with provided filters
func (p *Puzzle) FindRecent(ctx context.Context, params pagination.Params, filters entities.PuzzleFilters) (*entities.PuzzleConnection, error) {
	// Validate pagination params
	if err := params.Vally(entities.Puzzle{}); err != nil {
		return nil, err
	}
	params.Limit = params.Limit + 1

	nodes, err := p.repository.GetRecent(ctx, params, filters)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := buildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil

}

// Search searches for puzzles with a similar name or description as search term
func (p *Puzzle) Search(ctx context.Context, search string) (*entities.PuzzleConnection, error) {
	params := pagination.Params{
		Cursor:    "",
		Limit:     100,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	nodes, err := p.repository.Search(ctx, params, search)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := buildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// ToggleLike toggles a user's like status on a puzzle
func (p *Puzzle) ToggleLike(ctx context.Context, id uuid.UUID) (*entities.Like, error) {
	puzzle, err := p.repository.Get(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}

	like, err := p.repository.ToggleLike(ctx, puzzle.ID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleLike)
	}

	return like, nil
}

// Update updates an existing puzzles
func (p *Puzzle) Update(ctx context.Context, oldPuzzle, updatePuzzle entities.Puzzle) (*entities.Puzzle, error) {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleNotAuthorized)
	}

	if oldPuzzle.ID != updatePuzzle.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalid)
	}
	if oldPuzzle.CreatedBy.ID != updatePuzzle.CreatedBy.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalid)
	}
	if oldPuzzle.CreatedBy.ID != user.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleNotAuthorized)
	}

	if err := validate.Check(oldPuzzle); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalid)
	}
	if err := validate.Check(updatePuzzle); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalid)
	}

	// Ensure that no values outside of Name, Description, and, Group Description are changed
	updatePuzzle.ID = oldPuzzle.ID
	updatePuzzle.MaxAttempts = oldPuzzle.MaxAttempts
	updatePuzzle.TimeAllowed = oldPuzzle.TimeAllowed
	updatePuzzle.CreatedAt = oldPuzzle.CreatedAt
	updatePuzzle.CreatedBy = oldPuzzle.CreatedBy

	groups := []entities.Group{}
	for idx, group := range oldPuzzle.Groups {
		updated := updatePuzzle.Groups[idx]
		updated.ID = group.ID
		updated.Answers = group.Answers
		updated.Blocks = group.Blocks

		groups = append(groups, updated)
	}
	updatePuzzle.Groups = groups

	// Update UpdatedAt value
	now := time.Now()
	updatePuzzle.UpdatedAt = &now

	puzzle, err := p.repository.Update(ctx, updatePuzzle)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleUpdate)
	}

	return puzzle, nil
}

// Delete deletes an existing puzzle
func (p *Puzzle) Delete(ctx context.Context, id uuid.UUID) error {
	if err := p.repository.Delete(ctx, id); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleDelete)
	}

	return nil
}

// Creates a puzzle connection from pagination fields and nodes
func buildPuzzleConnection(limit int, sortKey string, nodes []entities.PuzzleNode) (*entities.PuzzleConnection, error) {
	var edges []entities.PuzzleEdge
	for _, node := range nodes {
		cursor, err := pagination.EncodeCursor(internal.ToCamel(sortKey, true), node)
		if err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
		}
		edges = append(edges, entities.PuzzleEdge{
			Cursor: cursor,
			Node:   node,
		})
	}

	hasNextPage := len(edges) > limit-1
	pageInfo := entities.PageInfo{
		Cursor:      "",
		HasNextPage: hasNextPage,
	}
	if hasNextPage {
		pageInfo.Cursor = edges[len(edges)-1].Cursor
		edges = edges[:len(edges)-1]
	}

	// If edges was not initialized then do so here to not trigger validation error
	if edges == nil {
		edges = []entities.PuzzleEdge{}
	}
	connection := entities.PuzzleConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := validate.Check(connection); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	return &connection, nil
}

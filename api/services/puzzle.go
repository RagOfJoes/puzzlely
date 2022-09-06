package services

import (
	"context"
	"errors"
	"strings"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// Errors
var (
	ErrPuzzleCreate          = errors.New("Failed to create puzzle.")
	ErrPuzzleDelete          = errors.New("Failed to delete puzzle.")
	ErrPuzzleInvalid         = errors.New("Invalid puzzle.")
	ErrPuzzleInvalidSearch   = errors.New("Invalid search term.")
	ErrPuzzleLike            = errors.New("Failed to like puzzle.")
	ErrPuzzleList            = errors.New("Failed to fetch puzzles.")
	ErrPuzzleNotAuthorized   = errors.New("Not authorized to access this puzzle.")
	ErrPuzzleNotFound        = errors.New("Puzzle not found.")
	ErrPuzzleUpdate          = errors.New("Failed to update puzzle.")
	ErrPuzzleUnauthenticated = errors.New("Must be authenticated to perform this action.")
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
	if err := newPuzzle.Validate(); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	puzzle, err := p.repository.Create(ctx, newPuzzle)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleCreate)
	}

	puzzle.CreatedBy = newPuzzle.CreatedBy
	if err := puzzle.Validate(); err != nil {
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
	if err := puzzle.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}
	if strict && puzzle.CreatedBy.ID != user.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleNotAuthorized)
	}

	return puzzle, nil
}

// FindCreated finds a list of puzzles that a user has created
func (p *Puzzle) FindCreated(ctx context.Context, params entities.Pagination, user entities.User) (*entities.PuzzleConnection, error) {
	if err := params.Validate(entities.PuzzleReflectType); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	params.Limit = params.Limit + 1

	nodes, err := p.repository.GetCreated(ctx, params, user.ID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	for _, node := range nodes {
		if node.CreatedBy.ID != user.ID {
			return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
		}
	}

	connection, err := entities.BuildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindLiked finds a list of puzzles that the current user has liked
func (p *Puzzle) FindLiked(ctx context.Context, params entities.Pagination) (*entities.PuzzleConnection, error) {
	if err := params.Validate(entities.PuzzleReflectType); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	params.Limit = params.Limit + 1

	nodes, err := p.repository.GetLiked(ctx, params)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	for _, node := range nodes {
		if node.NumOfLikes == 0 || node.LikedAt == nil {
			return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
		}
	}

	connection, err := entities.BuildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindMostLiked finds a list of most likes puzzles
func (p *Puzzle) FindMostLiked(ctx context.Context) (*entities.PuzzleConnection, error) {
	params := entities.Pagination{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	nodes, err := p.repository.GetMostLiked(ctx, params)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	for _, node := range nodes {
		if node.NumOfLikes == 0 {
			return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
		}
	}

	connection, err := entities.BuildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindMostPlayed finds a list of most played puzzles
func (p *Puzzle) FindMostPlayed(ctx context.Context) (*entities.PuzzleConnection, error) {
	params := entities.Pagination{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	nodes, err := p.repository.GetMostPlayed(ctx, params)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := entities.BuildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// FindRecent finds a list of puzzles sorted from newest to oldest and filtered with provided filters
func (p *Puzzle) FindRecent(ctx context.Context, params entities.Pagination, filters entities.PuzzleFilters) (*entities.PuzzleConnection, error) {
	// Validate pagination params
	if err := params.Validate(entities.PuzzleReflectType); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	params.Limit = params.Limit + 1

	nodes, err := p.repository.GetRecent(ctx, params, filters)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	for _, node := range nodes {
		if filters.CustomizableAttempts != nil {
			customizableAttempts := *filters.CustomizableAttempts
			if customizableAttempts && node.MaxAttempts != 0 {
				return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
			} else if !customizableAttempts && node.MaxAttempts == 0 {
				return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
			}
		}
		if filters.CustomizableTime != nil {
			customizableTime := *filters.CustomizableTime
			if customizableTime && node.TimeAllowed != 0 {
				return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
			} else if !customizableTime && node.TimeAllowed == 0 {
				return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
			}
		}
		if filters.Difficulty != nil {
			difficulty := *filters.Difficulty
			if node.Difficulty != difficulty {
				return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
			}
		}
		if filters.NumOfLikes != nil {
			numOfLikes := *filters.NumOfLikes
			if node.NumOfLikes < uint(numOfLikes) {
				return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrPuzzleList)
			}
		}
	}

	connection, err := entities.BuildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil

}

// Search searches for puzzles with a similar name or description as search term
func (p *Puzzle) Search(ctx context.Context, search string) (*entities.PuzzleConnection, error) {
	if err := validate.CheckPartial(entities.Puzzle{Name: search}, "Name"); err != nil {
		fixedErr := errors.New(strings.Replace(err.Error(), "name", "Search term", 1))
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", fixedErr)
	}
	if strings.Contains(search, "--") {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidSearch)
	}

	params := entities.Pagination{
		Cursor:    "",
		Limit:     100,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	nodes, err := p.repository.Search(ctx, params, search)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleList)
	}

	connection, err := entities.BuildPuzzleConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

// ToggleLike toggles a user's likhe status on a puzzle
func (p *Puzzle) ToggleLike(ctx context.Context, id uuid.UUID) (*entities.PuzzleLike, error) {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleUnauthenticated)
	}

	puzzle, err := p.repository.Get(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}

	// TODO: Pass like status here to cut down on number of requests
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
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleUnauthenticated)
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

	if err := oldPuzzle.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalid)
	}
	if err := updatePuzzle.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalid)
	}

	// Ensure that no values outside of Name, Description, and, Group Description are changed
	updatePuzzle.ID = oldPuzzle.ID
	updatePuzzle.MaxAttempts = oldPuzzle.MaxAttempts
	updatePuzzle.TimeAllowed = oldPuzzle.TimeAllowed
	updatePuzzle.CreatedAt = oldPuzzle.CreatedAt
	updatePuzzle.CreatedBy = oldPuzzle.CreatedBy

	groups := []entities.PuzzleGroup{}
	for idx, group := range oldPuzzle.Groups {
		updated := updatePuzzle.Groups[idx]
		updated.ID = group.ID
		updated.Answers = group.Answers
		updated.Blocks = group.Blocks

		groups = append(groups, updated)
	}
	updatePuzzle.Groups = groups

	puzzle, err := p.repository.Update(ctx, updatePuzzle)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleUpdate)
	}

	return puzzle, nil
}

// Delete deletes an existing puzzle
func (p *Puzzle) Delete(ctx context.Context, id uuid.UUID) error {
	if entities.UserFromContext(ctx) == nil {
		return internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrPuzzleUnauthenticated)
	}

	_, err := p.Find(ctx, id, true)
	if err != nil {
		return err
	}

	if err := p.repository.Delete(ctx, id); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleDelete)
	}

	return nil
}

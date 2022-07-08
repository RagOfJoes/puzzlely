package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

type UseCase interface {
	// New creates a New Puzzle
	New(ctx context.Context, newPuzzle puzzle.Puzzle) (*puzzle.Puzzle, error)
	// Find finds a Puzzle
	Find(ctx context.Context, strict bool, value string, currentUser *user.User) (*puzzle.Puzzle, error)
	// FindCreated finds a list of Puzzles that a User has created
	FindCreated(ctx context.Context, params pagination.Params, user user.User, currentUser *user.User) (*puzzle.Connection, error)
	// FindLiked finds a list of Puzzles that User has liked
	FindLiked(ctx context.Context, params pagination.Params, currentUser user.User) (*puzzle.Connection, error)
	// FindMostLiked finds a list of most liked Puzzles
	FindMostLiked(ctx context.Context, currentUser *user.User) (*puzzle.Connection, error)
	// FindMostPlayed finds a list of most played Puzzles
	FindMostPlayed(ctx context.Context, currentUser *user.User) (*puzzle.Connection, error)
	// FindRecent finds a list of Puzzles sorted by most recent CreatedAt
	FindRecent(ctx context.Context, params pagination.Params, filters puzzle.Filters, currentUser *user.User) (*puzzle.Connection, error)
	// Search searches for puzzles that have similar Name or Description as search term
	Search(ctx context.Context, search string, currentUser *user.User) (*puzzle.Connection, error)
	// ToggleLike toggles a User's like status on a Puzzle
	ToggleLike(ctx context.Context, id uuid.UUID, currentUser user.User) (*puzzle.Like, error)
	// Update updates an existing Puzzles
	Update(ctx context.Context, old, update puzzle.Puzzle, currentUser user.User) (*puzzle.Puzzle, error)
	// Delete deletes an existing Puzzle
	Delete(ctx context.Context, id uuid.UUID, currentUser user.User) error
}

package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/domains"
)

type Puzzle interface {
	// Create creates a new puzzle
	Create(ctx context.Context, newPuzzle domains.Puzzle) (*domains.Puzzle, error)

	// Get gets the puzzle with the given id
	Get(ctx context.Context, id string) (*domains.Puzzle, error)
	// GetCreated gets the puzzles created by the given user
	GetCreated(ctx context.Context, userID string, opts domains.PuzzleCursorPaginationOpts) ([]domains.PuzzleSummary, error)
	// GetLiked gets the puzzles liked by the given user
	GetLiked(ctx context.Context, userID string, opts domains.PuzzleCursorPaginationOpts) ([]domains.PuzzleSummary, error)
	// GetRecent gets the recent puzzles
	GetRecent(ctx context.Context, opts domains.PuzzleCursorPaginationOpts) ([]domains.Puzzle, error)
	// GetNextForRecent gets the potential next puzzle for `GetRecent`
	GetNextForRecent(ctx context.Context, cursor string) (*domains.Puzzle, error)
	// GetPreviousForRecent gets the potential previous for `GetRecent`
	GetPreviousForRecent(ctx context.Context, cursor string) (*domains.Puzzle, error)

	// ToggleLike likes a puzzle with the given id
	ToggleLike(ctx context.Context, id string) (*domains.PuzzleLike, error)
}

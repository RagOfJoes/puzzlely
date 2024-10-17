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
	GetCreated(ctx context.Context, userID string, cursor domains.Cursor) ([]domains.PuzzleSummary, error)
	// TODO: Figure out a way to make this work
	//
	// GetPopular gets the popular puzzles
	GetPopular(ctx context.Context, cursor domains.Cursor) ([]domains.Puzzle, error)
	// GetRecent gets the recent puzzles
	GetRecent(ctx context.Context, cursor domains.Cursor) ([]domains.Puzzle, error)
}

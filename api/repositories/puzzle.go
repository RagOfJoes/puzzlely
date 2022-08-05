package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/google/uuid"
)

// Puzzle defines methods for a puzzle repository
type Puzzle interface {
	// Create creates a new puzzle
	Create(ctx context.Context, newPuzzle entities.Puzzle) (*entities.Puzzle, error)
	// Get retrieves a puzzle with its id
	Get(ctx context.Context, id uuid.UUID) (*entities.Puzzle, error)
	// GetCreated retrieves a list of puzzles that a user has created
	GetCreated(ctx context.Context, params pagination.Params, userID uuid.UUID) ([]entities.PuzzleNode, error)
	// GetLiked retrieves a list of puzzles that the current user has liked
	GetLiked(ctx context.Context, params pagination.Params) ([]entities.PuzzleNode, error)
	// GetMostLiked retrieves a list of most liked puzzles
	GetMostLiked(ctx context.Context, params pagination.Params) ([]entities.PuzzleNode, error)
	// GetMostPlayed retrieves a list of most played puzzles
	GetMostPlayed(ctx context.Context, params pagination.Params) ([]entities.PuzzleNode, error)
	// GetRecent retrieves a list of puzzles sorted from newest to oldest and filtered with provided filters
	GetRecent(ctx context.Context, params pagination.Params, filters entities.PuzzleFilters) ([]entities.PuzzleNode, error)
	// Search searches for puzzles with a similar name or description as search term
	Search(ctx context.Context, params pagination.Params, search string) ([]entities.PuzzleNode, error)
	// ToggleLike toggles a user's like status on a puzzle
	ToggleLike(ctx context.Context, id uuid.UUID) (*entities.PuzzleLike, error)
	// Update updates a puzzle
	Update(ctx context.Context, updatePuzzle entities.Puzzle) (*entities.Puzzle, error)
	// Delete deletes a puzzle
	Delete(ctx context.Context, id uuid.UUID) error
}

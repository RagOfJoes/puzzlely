package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/domains"
)

type Game interface {
	// Create creates a new game
	Create(ctx context.Context, newGame domains.Game) (*domains.Game, error)

	// GetHistory gets the history of the given user
	GetHistory(ctx context.Context, cursor domains.Cursor, user domains.User) ([]domains.GameSummary, error)
	// GetWithPuzzleID gets the game with the given puzzle id
	GetWithPuzzleID(ctx context.Context, puzzleID string) (*domains.Game, error)

	// Update updates a game
	Update(ctx context.Context, updateGame domains.Game) error
}

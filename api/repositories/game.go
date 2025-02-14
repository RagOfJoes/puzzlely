package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/domains"
)

type Game interface {
	// GetHistory gets the history of the given user
	GetHistory(ctx context.Context, id string, opts domains.GameCursorPaginationOpts) ([]domains.GameSummary, error)
	// GetWithPuzzleID gets the game with the given puzzle id
	GetWithPuzzleID(ctx context.Context, id string) (*domains.Game, error)

	// Save saves a game
	Save(ctx context.Context, payload domains.Game) (*domains.Game, error)
}

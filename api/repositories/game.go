package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
)

// Game defines methods for a game repository
type Game interface {
	// Create creates a new game
	Create(ctx context.Context, newGame entities.Game) (*entities.Game, error)
	// Get retrieves a game with its id
	Get(ctx context.Context, id uuid.UUID) (*entities.Game, error)
	// GetPlayed retrieves all the games that a user has played and completed
	GetPlayed(ctx context.Context, params entities.Pagination, user entities.User) ([]entities.GameNode, error)
	// GetWithChallengeCode retrieves a game with its challenge code
	GetWithChallengeCode(ctx context.Context, challengeCode string) (*entities.Game, error)
	// Update updates a game
	Update(ctx context.Context, updateGame entities.Game) (*entities.Game, error)
}

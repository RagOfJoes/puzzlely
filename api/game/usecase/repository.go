package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/game"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, newGame game.Game) (*game.Game, error)
	Get(ctx context.Context, id uuid.UUID, currentUser *uuid.UUID) (*game.Game, error)
	GetPlayed(ctx context.Context, params pagination.Params, user user.User, currentUser *uuid.UUID) ([]*game.Node, error)
	GetWithChallengeCode(ctx context.Context, challengeCode string, currentUser *uuid.UUID) (*game.Game, error)
	Update(ctx context.Context, updateGame game.Game) (*game.Game, error)
}

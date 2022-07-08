package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, newPuzzle puzzle.Puzzle) (*puzzle.Puzzle, error)
	Get(ctx context.Context, value string, currentUser *uuid.UUID) (*puzzle.Puzzle, error)
	GetCreated(ctx context.Context, params pagination.Params, userID uuid.UUID, currentUser *uuid.UUID) ([]*puzzle.Node, error)
	GetLiked(ctx context.Context, params pagination.Params, currentUser uuid.UUID) ([]*puzzle.Node, error)
	GetMostLiked(ctx context.Context, params pagination.Params, currentUser *uuid.UUID) ([]*puzzle.Node, error)
	GetMostPlayed(ctx context.Context, params pagination.Params, currentUser *uuid.UUID) ([]*puzzle.Node, error)
	GetRecent(ctx context.Context, params pagination.Params, filters puzzle.Filters, currentUser *uuid.UUID) ([]*puzzle.Node, error)
	Search(ctx context.Context, params pagination.Params, search string, currentUser *uuid.UUID) ([]*puzzle.Node, error)
	ToggleLike(ctx context.Context, id uuid.UUID, currentUser uuid.UUID) (*puzzle.Like, error)
	Update(ctx context.Context, update puzzle.Puzzle) (*puzzle.Puzzle, error)
	Delete(ctx context.Context, id, currentUser uuid.UUID) error
}

package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/game"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

type UseCase interface {
	// New creates a new Game for Puzzle
	New(ctx context.Context, puzzle puzzle.Puzzle, currentUser *user.User) (*game.Game, error)
	// Challenge creates a new Game based off of an existing Game
	Challenge(ctx context.Context, challengeCode string, currentUser *user.User) (*game.Game, error)
	// Find finds a Game
	Find(ctx context.Context, id uuid.UUID, currentUser *user.User) (*game.Game, error)
	// FindPlayed finds all the Games played for a given User
	FindPlayed(ctx context.Context, params pagination.Params, user user.User, currentUser *user.User) (*game.Connection, error)
	// Complete completes a Game
	Complete(ctx context.Context, old, update game.Game, currentUser *user.User) (*game.Game, error)
	// Guess guesses a Game
	Guess(ctx context.Context, old, update game.Game, currentUser *user.User) (*game.Game, error)
}

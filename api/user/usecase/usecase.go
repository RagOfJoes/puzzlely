package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

type UseCase interface {
	// New creates a new User given a linked social account
	New(ctx context.Context, newUser user.User, newConnection user.Connection) (*user.User, error)
	// Find finds a User with their id or username. If `strict` is set to true then only `Complete` User's will be returned
	Find(ctx context.Context, search string, strict bool) (*user.User, error)
	// FindByConnection finds a User given one of their linked social account
	FindByConnection(ctx context.Context, provider, sub string) (*user.User, error)
	// FindStats calculates a User's stats
	FindStats(ctx context.Context, id uuid.UUID) (*user.Stats, error)
	// Update updates a User
	Update(ctx context.Context, update user.User) (*user.User, error)
	// Delete deletes a User
	Delete(ctx context.Context, id uuid.UUID) error
}

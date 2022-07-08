package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

type Repository interface {
	// Create creates a new User
	Create(ctx context.Context, newUser user.User, newConnection user.Connection) (*user.User, error)
	// Get retrieves a User with their id or username
	Get(ctx context.Context, search string) (*user.User, error)
	// GetStats retrieves User's relevant stats
	GetStats(ctx context.Context, id uuid.UUID) (*user.Stats, error)
	// GetWithConnection retrieves a User with Connection
	GetWithConnection(ctx context.Context, provider, sub string) (*user.User, error)
	// Update updates a User
	Update(ctx context.Context, updateUser user.User) (*user.User, error)
	// Delete deletes a User
	Delete(ctx context.Context, id uuid.UUID) error
}

package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
)

// User defines methods for a user repository
type User interface {
	// Create creates a new user
	Create(ctx context.Context, newConnection entities.Connection, newUser entities.User) (*entities.User, error)
	// Get retrieves a user with their id or username
	Get(ctx context.Context, search string) (*entities.User, error)
	// GetStats retrieves a user's stats given their id
	GetStats(ctx context.Context, id uuid.UUID) (*entities.Stats, error)
	// GetWithConnection retrieves a user with one of their connection
	GetWithConnection(ctx context.Context, provider, sub string) (*entities.User, error)
	// Update updates a user
	Update(ctx context.Context, updateUser entities.User) (*entities.User, error)
	// Delete deletes a user
	Delete(ctx context.Context, id uuid.UUID) error
}

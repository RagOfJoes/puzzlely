package repositories

import (
	"context"
	"errors"

	"github.com/RagOfJoes/puzzlely/domains"
)

// Errors
var (
	ErrUserUsernameNotAvailable = errors.New("Username is not available.")
)

// User defines methods for a user repository
type User interface {
	// Create creates a new user
	Create(ctx context.Context, newConnection domains.Connection, newUser domains.User) (*domains.User, error)

	// Get retrieves a user with their id
	Get(ctx context.Context, id string) (*domains.User, error)
	// GetWithConnection retrieves a user with one of their connection
	GetWithConnection(ctx context.Context, connection domains.Connection) (*domains.User, error)

	// Update updates a user
	Update(ctx context.Context, user domains.User) (*domains.User, error)

	// Delete deletes a user
	Delete(ctx context.Context, id string) error
}

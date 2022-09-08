package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
)

// Session defines methods for a session repository
type Session interface {
	// Create creates a new session
	Create(ctx context.Context, newSession entities.Session) (*entities.Session, error)
	// Get retrieves a session with its id
	Get(ctx context.Context, id uuid.UUID) (*entities.Session, error)
	// GetWithToken retrieves a session with its token
	GetWithToken(ctx context.Context, token string) (*entities.Session, error)
	// Update updates a session
	Update(ctx context.Context, updateSession entities.Session) (*entities.Session, error)
	// Delete deletes a session
	Delete(ctx context.Context, id uuid.UUID) error
}

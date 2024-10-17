package repositories

import (
	"context"

	"github.com/RagOfJoes/puzzlely/domains"
)

// Session defines methods for a session repository
type Session interface {
	// Create creates a new session
	Create(ctx context.Context, newSession domains.Session) (*domains.Session, error)

	// Get retrieves a session with its id
	Get(ctx context.Context, id string) (*domains.Session, error)

	// Update updates a session
	Update(ctx context.Context, updateSession domains.Session) (*domains.Session, error)

	// Delete deletes a session
	Delete(ctx context.Context, id string) error
}

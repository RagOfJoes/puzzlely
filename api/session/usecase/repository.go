package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/session"
	"github.com/google/uuid"
)

type Repository interface {
	// Create creates a new Session
	Create(ctx context.Context, newSession session.Session) (*session.Session, error)
	// Get retrieves a Session with id
	Get(ctx context.Context, id uuid.UUID) (*session.Session, error)
	// GetWithToken retrieves a Session with token
	GetWithToken(ctx context.Context, token string) (*session.Session, error)
	// Update updates a Session
	Update(ctx context.Context, updateSession session.Session) (*session.Session, error)
	// Delete deletes a Session
	Delete(ctx context.Context, id uuid.UUID) error
}

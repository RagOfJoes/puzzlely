package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/session"
	"github.com/google/uuid"
)

type UseCase interface {
	// New creates a new Session
	New(ctx context.Context, newSession session.Session) (*session.Session, error)
	// FindByID finds a Session via its ID
	FindByID(ctx context.Context, id uuid.UUID) (*session.Session, error)
	// FindByToken finds a Session via its token
	FindByToken(ctx context.Context, token string) (*session.Session, error)
	// Update updates a Session
	Update(ctx context.Context, updateSession session.Session) (*session.Session, error)
	// Destroy deletes a Session
	Destroy(ctx context.Context, id uuid.UUID) error
}

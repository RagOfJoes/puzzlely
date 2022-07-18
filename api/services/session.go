package services

import (
	"context"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
)

// Errors
var (
	ErrSessionCreate       = "Failed to create session."
	ErrSessionDelete       = "Failed to delete session."
	ErrSessionInvalid      = "Invalid session provided."
	ErrSessionInvalidID    = "Invalid session id provided."
	ErrSessionInvalidToken = "Invalid session token provided."
	ErrSessionUpdate       = "Failed to update session."
)

// Session defines the session service
type Session struct {
	config     config.Configuration
	repository repositories.Session
}

// NewSession instantiates a session service
func NewSession(config config.Configuration, repositry repositories.Session) Session {
	return Session{
		config:     config,
		repository: repositry,
	}
}

// New creates a new session
func (s *Session) New(ctx context.Context, newSession entities.Session) (*entities.Session, error) {
	if err := validate.Check(newSession); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalid)
	}

	session, err := s.repository.Create(ctx, newSession)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionCreate)
	}

	return session, nil
}

// FindByID retrieves a session with its id
func (s *Session) FindByID(ctx context.Context, id uuid.UUID) (*entities.Session, error) {
	session, err := s.repository.Get(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}
	if err := session.Validate(); err != nil {
		return nil, err
	}
	strip(session)

	return session, nil
}

// FindByToken retrieves a session with its token
func (s *Session) FindByToken(ctx context.Context, token string) (*entities.Session, error) {
	session, err := s.repository.GetWithToken(ctx, token)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidToken)
	}
	if err := session.Validate(); err != nil {
		return nil, err
	}
	strip(session)

	return session, nil
}

// Update updates a session
func (s *Session) Update(ctx context.Context, updateSession entities.Session) (*entities.Session, error) {
	if err := updateSession.Validate(); err != nil {
		return nil, err
	}

	session, err := s.repository.Update(ctx, updateSession)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionUpdate)
	}
	strip(session)

	return session, nil
}

// Delete deletes a session
func (s *Session) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repository.Delete(ctx, id); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionDelete)
	}

	return nil
}

// Ensure that a user isn't accidentally sent over to the client if not properly authenticated
func strip(session *entities.Session) {
	if !session.IsAuthenticated() {
		session.User = nil
	}
}
package services

import (
	"context"
	"database/sql"
	"errors"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"
)

// Errors
var (
	ErrSessionCreate    = errors.New("Failed to create session.")
	ErrSessionDelete    = errors.New("Failed to delete session.")
	ErrSessionInvalid   = errors.New("Invalid session provided.")
	ErrSessionInvalidID = errors.New("Invalid session id provided.")
	ErrSessionUpdate    = errors.New("Failed to update session.")
)

// Session defines the session service
type Session struct {
	repository repositories.Session
}

type SessionDependencies struct {
	Repository repositories.Session
}

// NewSession instantiates a session service
func NewSession(dependencies SessionDependencies) Session {
	logrus.Print("Created Session Service")

	return Session{
		repository: dependencies.Repository,
	}
}

// New creates a new session
func (s *Session) New(ctx context.Context, newSession domains.Session) (*domains.Session, error) {
	if err := newSession.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalid)
	}

	createdSession, err := s.repository.Create(ctx, newSession)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionCreate)
	}

	return createdSession, nil
}

// FindByID retrieves a session with its id
func (s *Session) FindByID(ctx context.Context, id ulid.ULID) (*domains.Session, error) {
	foundSession, err := s.repository.Get(ctx, id.String())
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}
	if err := foundSession.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}
	strip(foundSession)

	return foundSession, nil
}

// Update updates a session
func (s *Session) Update(ctx context.Context, updateSession domains.Session) (*domains.Session, error) {
	if err := updateSession.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalid)
	}

	updatedSession, err := s.repository.Update(ctx, updateSession)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionUpdate)
	}
	strip(updatedSession)

	return updatedSession, nil
}

// Delete deletes a session
func (s *Session) Delete(ctx context.Context, id ulid.ULID) error {
	if err := s.repository.Delete(ctx, id.String()); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionDelete)
	}

	return nil
}

// Ensure that a user isn't accidentally sent over to the client if not properly authenticated
func strip(session *domains.Session) {
	if !session.IsAuthenticated() {
		session.UserID = sql.NullString{
			String: "",
			Valid:  false,
		}
		session.User = nil
	}
}

package session

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
	"github.com/rs/xid"
)

func New() Session {
	id := uuid.New()
	now := time.Now()
	token := xid.New().String()
	return Session{
		ID:        id,
		Token:     token,
		State:     Unauthenticated,
		CreatedAt: now,
	}
}

func (s *Session) Authenticate(lifetime time.Duration, user user.User) error {
	now := time.Now()
	expire := now.Add(lifetime)
	s.State = Authenticated
	s.ExpiresAt = &expire
	s.AuthenticatedAt = &now
	s.User = &user
	return nil
}

// Validations
//

func (s *Session) IsAuthenticated() bool {
	if s.State == Authenticated && !s.IsExpired() && s.User != nil {
		return true
	}
	return false
}

func (s *Session) IsExpired() bool {
	if s.ExpiresAt != nil && s.ExpiresAt.Before(time.Now()) {
		return true
	}
	return false
}

func (s *Session) IsValid() error {
	if err := validate.Check(s); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%s", ErrInvalidSession)
	}
	if s.State == Authenticated && (s.ExpiresAt == nil || s.AuthenticatedAt == nil) {
		return internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrInvalidSession)
	}
	if s.IsExpired() {
		return internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrInvalidSession)
	}
	return nil
}

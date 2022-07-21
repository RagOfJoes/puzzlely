package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
	"github.com/rs/xid"
)

var _ Entity = (*Session)(nil)

type SessionState string

const (
	Unauthenticated SessionState = "Unauthenticated"
	Authenticated   SessionState = "Authenticated"
)

// Session defines a user session
type Session struct {
	// ID defines the unique id for the session
	ID uuid.UUID `json:"id" validate:"required"`
	// State defines the current state of the Session
	State SessionState `json:"state" validate:"required,oneof='Unauthenticated' 'Authenticated'"`
	// Token can be used by API clients to fetch current session by passing token in `X-Session-Token` Header
	//
	// Will only be provided once to the client and that's on successful: log in or sign up
	Token string `json:"-" validate:"required"`
	// CreatedAt defines when the session was created
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// ExpiresAt defines the expiration of the session. This'll only be applicable when `State` is `Authenticated`
	ExpiresAt *time.Time `json:"expiresAt" validate:"required_if=State Authenticated,omitempty,gtfield=CreatedAt"`
	// AuthenticatedAt defines the time when user was successfully logged in
	AuthenticatedAt *time.Time `json:"authenticatedAt" validate:"required_if=State Authenticated,omitempty,ltfield=ExpiresAt"`

	// User is the user, if any, that the session belongs to
	User *User `json:"user" validate:"required_if=State Authenticated,omitempty,dive"`
}

func NewSession() Session {
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

// Authenticate authenticates the session
func (s *Session) Authenticate(lifetime time.Duration, user User) error {
	now := time.Now()
	expire := now.Add(lifetime)
	s.State = Authenticated
	s.ExpiresAt = &expire
	s.AuthenticatedAt = &now
	s.User = &user

	return nil
}

// IsAuthenticated checks whether the session is propery authenticated and not expired
func (s *Session) IsAuthenticated() bool {
	if s.State == Authenticated && !s.IsExpired() && s.User != nil {
		return true
	}

	return false
}

// IsExpired checks whether the session has ExpiresAt set or is expired
func (s *Session) IsExpired() bool {
	if s.ExpiresAt == nil || s.ExpiresAt.Before(time.Now()) {
		return true
	}

	return false
}

func (s *Session) Validate() error {
	return validate.Check(s)
}

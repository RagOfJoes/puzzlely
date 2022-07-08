package mysql

import (
	"time"

	"github.com/RagOfJoes/puzzlely/session"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

type Session struct {
	// ID defines the unique id for the session
	ID uuid.UUID `db:"id"`
	// State defines the current state of the Session
	State string `db:"state"`
	// Token can be used by API clients to fetch current session by passing token in `X-Session-Token` Header
	//
	// Will only be provided once to the client and that's on successful: log in or sign up
	Token string `db:"token"`
	// CreatedAt defines when the session was created
	CreatedAt time.Time `db:"created_at"`
	// ExpiresAt defines the expiration of the session. This'll only be applicable when `State` is `Authenticated`
	ExpiresAt *time.Time `db:"expires_at"`
	// AuthenticatedAt defines the time when user was successfully logged in
	AuthenticatedAt *time.Time `db:"authenticated_at"`

	// UserID defines the ID of the User the Session belongs to
	UserID *uuid.UUID `db:"user_id"`
}

func fromEntity(entity session.Session) Session {
	model := Session{
		ID:              entity.ID,
		State:           string(entity.State),
		Token:           entity.Token,
		CreatedAt:       entity.CreatedAt,
		ExpiresAt:       entity.ExpiresAt,
		AuthenticatedAt: entity.AuthenticatedAt,
	}
	if entity.User != nil {
		model.UserID = &entity.User.ID
	}
	return model
}

func (s *Session) toEntity() session.Session {
	entity := session.Session{
		ID:              s.ID,
		Token:           s.Token,
		State:           session.State(s.State),
		CreatedAt:       s.CreatedAt,
		ExpiresAt:       s.ExpiresAt,
		AuthenticatedAt: s.AuthenticatedAt,
	}
	if s.UserID != nil {
		entity.User = &user.User{
			ID: *s.UserID,
		}
	}
	return entity
}

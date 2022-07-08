package session

import (
	"time"

	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

// State defines the current state of the session
type State string

const (
	// Unauthenticated is the default State
	Unauthenticated State = "Unauthenticated"
	// Authenticated occurs when the User has successfully authenticated
	Authenticated State = "Authenticated"
)

type Session struct {
	// ID defines the unique id for the session
	ID uuid.UUID `json:"id" validate:"required"`
	// State defines the current state of the Session
	State State `json:"state" validate:"required"`
	// Token can be used by API clients to fetch current session by passing token in `X-Session-Token` Header
	//
	// Will only be provided once to the client and that's on successful: log in or sign up
	Token string `json:"-" validate:"required"`
	// CreatedAt defines when the session was created
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// ExpiresAt defines the expiration of the session. This'll only be applicable when `State` is `Authenticated`
	ExpiresAt *time.Time `json:"expiresAt" validate:"required_if=State Authenticated"`
	// AuthenticatedAt defines the time when user was successfully logged in
	AuthenticatedAt *time.Time `json:"authenticatedAt" validate:"required_if=State Authenticated"`

	// User is the user, if any, that the session belongs to
	User *user.User `json:"user"`
}

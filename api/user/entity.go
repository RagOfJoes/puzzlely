package user

import (
	"time"

	"github.com/google/uuid"
	"github.com/rs/xid"
)

// Connection defines a User's social account that allows for
type Connection struct {
	ID       uuid.UUID `json:"id" validate:"required"`
	Provider string    `json:"provider" validate:"required,oneof='discord' 'google' 'github' 'microsoft'"`
	Sub      string    `json:"sub" validate:"required"`
}

type State string

var (
	// Pending occurs when User has at least one Connection but has yet to create a unique username
	Pending State = "PENDING"
	// Complete occurs when User has completed all necessary sign up steps
	Complete State = "COMPLETE"
)

type User struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// State
	State State `json:"state" validate:"required,oneof='PENDING' 'COMPLETE'"`
	// Username
	Username string `json:"username" validate:"required,notblank,alphanum,min=4,max=24"`
	// CreatedAt is self-explanatory
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// UpdatedAt is self-explanatory
	UpdatedAt *time.Time `json:"updatedAt"`
}

type Stats struct {
	GamesPlayed    int `json:"gamesPlayed"`
	PuzzlesCreated int `json:"puzzlesCreated"`
	PuzzlesLiked   int `json:"puzzlesLiked"`
}

func NewConnection(provider, sub string) Connection {
	return Connection{
		ID:       uuid.New(),
		Provider: provider,
		Sub:      sub,
	}
}

func NewUser() User {
	id := uuid.New()
	now := time.Now()
	// Temp username
	username := xid.New().String()
	return User{
		ID:        id,
		CreatedAt: now,
		State:     Pending,
		Username:  username,
		UpdatedAt: nil,
	}
}

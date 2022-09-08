package entities

import (
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*Connection)(nil)

// Connection defines a user's social account info
type Connection struct {
	// ID defines the unique id for the connection
	ID uuid.UUID `json:"id" validate:"required"`
	// Provider defines the social provider that connects to a user's account
	Provider string `json:"provider" validate:"required,oneof='discord' 'google' 'github'"`
	// Sub defines the unique identifier that the social provider has for the user
	Sub string `json:"sub" validate:"required"`
	// UserID defines the id of the user this connection belongs to
	UserID uuid.UUID `json:"-" validate:"required"`
}

// NewConnection creates a new connection for a given user
func NewConnection(provider, sub string, userID uuid.UUID) Connection {
	return Connection{
		ID:       uuid.New(),
		Provider: provider,
		Sub:      sub,
		UserID:   userID,
	}
}

func (c *Connection) Validate() error {
	return validate.Check(c)
}

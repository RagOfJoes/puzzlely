package domains

import (
	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/oklog/ulid/v2"
)

var _ Domain = (*Connection)(nil)

// Connection defines a user's social account info
type Connection struct {
	// ID defines the unique id for the connection
	ID string `bun:"type:varchar(26),pk,notnull" json:"id"`
	// Provider defines the social provider that connects to a user's account
	Provider string `bun:"type:varchar(24),notnull" json:"provider"`
	// Sub defines the unique identifier that the social provider has for the user
	Sub string `bun:"type:varchar(128),unique,notnull" json:"sub"`

	// UserID defines the id of the user this connection belongs to
	UserID string `bun:"type:varchar(26),notnull" json:"-"`
}

// NewConnection creates a new connection for a given user
func NewConnection(provider, sub string, userID string) Connection {
	return Connection{
		ID:       ulid.Make().String(),
		Provider: provider,
		Sub:      sub,

		UserID: userID,
	}
}

func (c Connection) Validate() error {
	return validation.ValidateStruct(&c,
		validation.Field(&c.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&c.Provider, validation.Required, validation.In("discord", "google", "github")),
		validation.Field(&c.Sub, validation.Required),

		validation.Field(&c.UserID, validation.Required, validation.By(internal.IsULID)),
	)
}

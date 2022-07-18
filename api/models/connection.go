package models

import "github.com/google/uuid"

var _ Model = (*Connection)(nil)

// Connection defines the db model for user connection
type Connection struct {
	Bare

	Provider string    `db:"provider"`
	Sub      string    `db:"sub"`
	UserID   uuid.UUID `db:"user_id"`
}

func (c *Connection) TableName() string {
	return "connections"
}

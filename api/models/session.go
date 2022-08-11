package models

import (
	"time"

	"github.com/google/uuid"
)

var _ Model = (*Session)(nil)

type Session struct {
	Bare

	State           string     `db:"state"`
	Token           string     `db:"token"`
	CreatedAt       time.Time  `db:"created_at"`
	ExpiresAt       *time.Time `db:"expires_at"`
	AuthenticatedAt *time.Time `db:"authenticated_at"`

	UserID uuid.NullUUID `db:"user_id"`
}

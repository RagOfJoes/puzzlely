package models

import (
	"github.com/google/uuid"
)

var _ Model = (*Puzzle)(nil)

type Puzzle struct {
	Base

	Name        string    `db:"name"`
	Description string    `db:"description"`
	Difficulty  string    `db:"difficulty"`
	MaxAttempts uint16    `db:"max_attempts"`
	TimeAllowed uint32    `db:"time_allowed"`
	UserID      uuid.UUID `db:"user_id"`
}

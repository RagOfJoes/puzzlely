package models

import (
	"time"

	"github.com/google/uuid"
)

var _ Model = (*Like)(nil)

type Like struct {
	ID        uuid.UUID `db:"id"`
	Active    bool      `db:"active"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
	PuzzleID  uuid.UUID `db:"puzzle_id"`
	UserID    uuid.UUID `db:"user_id"`
}

func (l *Like) HasID() bool {
	return l.GetID() != uuid.Nil
}

func (l *Like) GetID() uuid.UUID {
	return l.ID
}

func (l *Like) GetCreated() time.Time {
	return l.CreatedAt
}

func (l *Like) GetUpdated() time.Time {
	return l.UpdatedAt
}

func (l *Like) RefreshUpdated() {
	l.UpdatedAt = time.Now()
}

func (l *Like) TableName() string {
	return "puzzle_likes"
}

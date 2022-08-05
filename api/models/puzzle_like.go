package models

import (
	"time"

	"github.com/google/uuid"
)

var _ Model = (*PuzzleLike)(nil)

type PuzzleLike struct {
	ID        uuid.UUID `db:"id"`
	Active    bool      `db:"active"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
	PuzzleID  uuid.UUID `db:"puzzle_id"`
	UserID    uuid.UUID `db:"user_id"`
}

func (l *PuzzleLike) HasID() bool {
	return l.GetID() != uuid.Nil
}

func (l *PuzzleLike) GetID() uuid.UUID {
	return l.ID
}

func (l *PuzzleLike) GetCreated() time.Time {
	return l.CreatedAt
}

func (l *PuzzleLike) GetUpdated() time.Time {
	return l.UpdatedAt
}

func (l *PuzzleLike) RefreshUpdated() {
	l.UpdatedAt = time.Now()
}

func (l *PuzzleLike) TableName() string {
	return "puzzle_likes"
}

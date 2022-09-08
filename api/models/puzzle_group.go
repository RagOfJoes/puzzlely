package models

import "github.com/google/uuid"

var _ Model = (*PuzzleGroup)(nil)

type PuzzleGroup struct {
	Bare

	Description string    `db:"description"`
	PuzzleID    uuid.UUID `db:"puzzle_id"`
}

package models

import "github.com/google/uuid"

var _ Model = (*PuzzleGroupAnswer)(nil)

type PuzzleGroupAnswer struct {
	Bare

	Answer        string    `db:"answer"`
	PuzzleGroupID uuid.UUID `db:"puzzle_group_id"`
}

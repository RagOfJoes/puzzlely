package models

import "github.com/google/uuid"

var _ Model = (*GroupAnswer)(nil)

type GroupAnswer struct {
	Bare

	Answer        string    `db:"answer"`
	PuzzleGroupID uuid.UUID `db:"puzzle_group_id"`
}

func (g *GroupAnswer) TableName() string {
	return "puzzle_group_answers"
}

package models

import "github.com/google/uuid"

var _ Model = (*PuzzleBlock)(nil)

type PuzzleBlock struct {
	Bare

	Value   string    `db:"value"`
	GroupID uuid.UUID `db:"puzzle_group_id"`
}

func (b *PuzzleBlock) TableName() string {
	return "puzzle_blocks"
}

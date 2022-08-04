package models

import "github.com/google/uuid"

var _ Model = (*Block)(nil)

type Block struct {
	Bare

	Value   string    `db:"value"`
	GroupID uuid.UUID `db:"puzzle_group_id"`
}

func (b *Block) TableName() string {
	return "puzzle_blocks"
}

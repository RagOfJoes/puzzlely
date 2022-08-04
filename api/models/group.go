package models

import "github.com/google/uuid"

var _ Model = (*Group)(nil)

type Group struct {
	Bare

	Description string    `db:"description"`
	PuzzleID    uuid.UUID `db:"puzzle_id"`
}

func (g *Group) TableName() string {
	return "puzzle_groups"
}

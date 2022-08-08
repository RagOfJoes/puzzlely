package models

import (
	"database/sql"

	"github.com/google/uuid"
)

var _ Model = (*GameAttempt)(nil)

type GameAttempt struct {
	Bare

	Order         sql.NullInt16 `db:"order"`
	PuzzleBlockID uuid.UUID     `db:"puzzle_block_id"`
	GameID        uuid.UUID     `db:"game_id"`
}

func (g *GameAttempt) TableName() string {
	return "game_attempts"
}

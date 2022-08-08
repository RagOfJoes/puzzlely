package models

import (
	"database/sql"

	"github.com/google/uuid"
)

var _ Model = (*GameResult)(nil)

type GameResult struct {
	Bare

	Guess         sql.NullString `db:"guess"`
	Correct       sql.NullBool   `db:"correct"`
	GameID        uuid.UUID      `db:"game_id"`
	PuzzleGroupID uuid.UUID      `db:"puzzle_group_id"`
}

func (g *GameResult) TableName() string {
	return "game_results"
}

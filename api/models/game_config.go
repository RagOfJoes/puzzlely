package models

import (
	"database/sql"

	"github.com/google/uuid"
)

var _ Model = (*GameConfig)(nil)

type GameConfig struct {
	Bare

	MaxAttempts sql.NullInt16 `db:"max_attempts"`
	TimeAllowed sql.NullInt32 `db:"time_allowed"`
	GameID      uuid.UUID     `db:"game_id"`
}

func (g *GameConfig) TableName() string {
	return "game_configs"
}

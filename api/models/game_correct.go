package models

import "github.com/google/uuid"

var _ Model = (*GameCorrect)(nil)

type GameCorrect struct {
	Bare

	PuzzleGroupID uuid.UUID `db:"puzzle_group_id"`
	GameID        uuid.UUID `db:"game_id"`
}

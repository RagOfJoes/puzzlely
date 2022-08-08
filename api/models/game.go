package models

import (
	"time"

	"github.com/google/uuid"
)

var _ Model = (*Game)(nil)

type Game struct {
	Bare

	Score         uint8      `db:"score"`
	ChallengeCode string     `db:"challenge_code"`
	CreatedAt     time.Time  `db:"created_at"`
	StartedAt     *time.Time `db:"started_at"`
	GuessedAt     *time.Time `db:"guessed_at"`
	CompletedAt   *time.Time `db:"completed_at"`
	ChallengedBy  *uuid.UUID `db:"challenged_by"`
	PuzzleID      uuid.UUID  `db:"puzzle_id"`
	UserID        *uuid.UUID `db:"user_id"`
}

func (g *Game) TableName() string {
	return "games"
}

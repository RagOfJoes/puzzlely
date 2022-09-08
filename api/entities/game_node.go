package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*GameNode)(nil)

type GameNode struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Score defines the score for the game
	Score uint8 `json:"score" validate:"min=0,max=8"`
	// Attempts user took before GuessedAt is set
	Attempts uint8 `json:"attempts" validate:"min=0"`
	// Config is the configuration for the game that the user set
	Config GameConfig `json:"config" validate:"required"`
	// ChallengeCode allows other users to copy the Config to compete with one another
	ChallengeCode string `json:"challengeCode" validate:"required"`
	// CreatedAt defines when Game was created
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// StartedAt defines when Game was started
	StartedAt *time.Time `json:"startedAt" validate:"omitempty,gtfield=CreatedAt"`
	// GuessedAt defines when User has either run out of time, run out of lives, or connected all Puzzle.Blocks into proper Puzzle.Groups
	GuessedAt *time.Time `json:"guessedAt" validate:"omitempty,gtfield=StartedAt"`
	// CompletedAt defines when User has set GuessedAt field and has provided their guess at Puzzle.Groups connections
	CompletedAt *time.Time `json:"completedAt" validate:"omitempty,gtfield=GuessedAt"`
	// Puzzle defines the puzzle that the game is for
	Puzzle PuzzleNode `json:"puzzle" validate:"required,dive"`
	// User is the user that this game belongs to
	User *User `json:"user" validate:"omitempty,dive"`
}

func (g *GameNode) Validate() error {
	return validate.Check(g)
}

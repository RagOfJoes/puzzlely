package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*GameResponse)(nil)

// GameResponse omits ChallengedBy, Puzzle, and, User field
type GameResponse struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Score defines the score for the game
	Score uint8 `json:"score" validate:"min=0,max=8"`
	// Attempts user took before GuessedAt is set
	Attempts [][]uuid.UUID `json:"attempts" validate:"dive,len=4"`
	// Correct are the ids of the Groups that the User linked correctly
	Correct []uuid.UUID `json:"correct" validate:"max=4"`
	// Config is the configuration for the game that the user set
	Config GameConfig `json:"config" validate:"required"`
	// // Result is the result of the User's guesses of Puzzle.Group's correlation
	Results []GameResult `json:"results"`
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
}

func (g *GameResponse) Validate() error {
	return validate.Check(g)
}

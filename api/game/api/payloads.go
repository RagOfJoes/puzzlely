package api

import (
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/game"
	"github.com/google/uuid"
)

type UpdateGameConfigPayload struct {
	// MaxAttempts defines the amount of attempts a User can take to complete the game
	MaxAttempts uint16 `json:"maxAttempts,omitempty"`
	// TimeAllowed defines the amount of time a User can take to complete the game
	TimeAllowed uint32 `json:"timeAllowed,omitempty"`
}

type UpdateGamePayload struct {
	// Score defines the score for the game
	Score uint8 `json:"score" validate:"min=0,max=8"`
	// Attempts user took before GuessedAt is set
	Attempts [][]uuid.UUID `json:"attempts" validate:"dive,len=4"`
	// Correct are the ids of the Groups that the User linked correctly
	Correct []uuid.UUID `json:"correct" validate:"max=4"`
	// Config is the configuration for the game that the user set
	Config UpdateGameConfigPayload `json:"config" validate:"required"`
	// Results is the result of the game
	Results []game.Result `json:"results"`
	// StartedAt defines when Game was started
	StartedAt *time.Time `json:"startedAt"`
	// GuessedAt defines when User has either run out of time, run out of lives, or connected all Puzzle.Blocks into proper Puzzle.Groups
	GuessedAt *time.Time `json:"guessedAt" validate:"omitempty,gtfield=StartedAt"`
	// CompletedAt defines when User has set GuessedAt field and has provided their guess at Puzzle.Groups connections
	CompletedAt *time.Time `json:"completedAt" validate:"omitempty,gtfield=GuessedAt"`
}

func (c *UpdateGamePayload) Bind(r *http.Request) error {
	return nil
}

func (c *UpdateGamePayload) toEntity(from game.Game) game.Game {
	config := from.Config
	if c.Config.MaxAttempts != config.MaxAttempts {
		config.MaxAttempts = c.Config.MaxAttempts
	}
	if c.Config.TimeAllowed != config.TimeAllowed {
		config.TimeAllowed = c.Config.TimeAllowed
	}

	return game.Game{
		ID:            from.ID,
		Score:         c.Score,
		Attempts:      c.Attempts,
		Correct:       c.Correct,
		Config:        config,
		Results:       c.Results,
		ChallengeCode: from.ChallengeCode,
		CreatedAt:     from.CreatedAt,
		StartedAt:     c.StartedAt,
		GuessedAt:     c.GuessedAt,
		CompletedAt:   c.CompletedAt,
		ChallengedBy:  from.ChallengedBy,
		Puzzle:        from.Puzzle,
		User:          from.User,
	}
}

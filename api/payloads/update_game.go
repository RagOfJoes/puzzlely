package payloads

import (
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

var _ render.Binder = (*UpdateGame)(nil)

type UpdateGameConfig struct {
	// MaxAttempts defines the amount of attempts a User can take to complete the game
	MaxAttempts uint16 `json:"maxAttempts,omitempty"`
	// TimeAllowed defines the amount of time a User can take to complete the game
	TimeAllowed uint32 `json:"timeAllowed,omitempty"`
}

type UpdateGame struct {
	// Score defines the score for the game
	Score uint8 `json:"score" validate:"min=0,max=8"`
	// Attempts user took before GuessedAt is set
	Attempts [][]uuid.UUID `json:"attempts" validate:"dive,len=4"`
	// Correct are the ids of the Groups that the User linked correctly
	Correct []uuid.UUID `json:"correct" validate:"max=4"`
	// Config is the configuration for the game that the user set
	Config UpdateGameConfig `json:"config" validate:"required"`
	// Results is the result of the game
	Results []entities.GameResult `json:"results"`
	// StartedAt defines when Game was started
	StartedAt *time.Time `json:"startedAt"`
	// GuessedAt defines when User has either run out of time, run out of lives, or connected all Puzzle.Blocks into proper Puzzle.Groups
	GuessedAt *time.Time `json:"guessedAt" validate:"omitempty,gtfield=StartedAt"`
	// CompletedAt defines when User has set GuessedAt field and has provided their guess at Puzzle.Groups connections
	CompletedAt *time.Time `json:"completedAt" validate:"omitempty,gtfield=GuessedAt"`
}

func (u *UpdateGame) Bind(r *http.Request) error {
	return nil
}

func (u *UpdateGame) ToEntity(oldGame entities.Game) entities.Game {
	config := oldGame.Config
	if u.Config.MaxAttempts != config.MaxAttempts {
		config.MaxAttempts = u.Config.MaxAttempts
	}
	if u.Config.TimeAllowed != config.TimeAllowed {
		config.TimeAllowed = u.Config.TimeAllowed
	}

	return entities.Game{
		ID:            oldGame.ID,
		Score:         u.Score,
		Attempts:      u.Attempts,
		Correct:       u.Correct,
		Config:        config,
		Results:       u.Results,
		ChallengeCode: oldGame.ChallengeCode,
		CreatedAt:     oldGame.CreatedAt,
		StartedAt:     u.StartedAt,
		GuessedAt:     u.GuessedAt,
		CompletedAt:   u.CompletedAt,
		ChallengedBy:  oldGame.ChallengedBy,
		Puzzle:        oldGame.Puzzle,
		User:          oldGame.User,
	}
}

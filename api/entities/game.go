package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
	"github.com/rs/xid"
)

var _ Entity = (*Game)(nil)

// Game defines a game
type Game struct {
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
	// ChallengedBy is the game that the current game is based off of
	ChallengedBy *GameNode `json:"challengedBy" validate:"omitempty,dive"`
	// Puzzle defines the puzzle that the game is for
	Puzzle Puzzle `json:"puzzle" validate:"required,dive"`
	// User is the user that this game belongs to
	User *User `json:"user" validate:"omitempty,dive"`
}

// NewGame creates a new game for a given user
func NewGame(puzzle Puzzle, user *User) Game {
	id := uuid.New()
	now := time.Now()
	challengeCode := xid.New().String()

	// Setup Config
	config := GameConfig{}
	// First configure based on difficulty
	switch puzzle.Difficulty {
	case Hard:
		config.MaxAttempts = 12
		// 3 minutes
		config.TimeAllowed = 180000
	case Medium:
		config.MaxAttempts = 18
		// 5 minutes
		config.TimeAllowed = 300000
	default:
		config.MaxAttempts = 24
		// 10 minutes
		config.TimeAllowed = 600000
	}
	// If Puzzle doesn't allow for it then use Puzzle's settings
	if puzzle.MaxAttempts > 0 {
		config.MaxAttempts = puzzle.MaxAttempts
	}
	if puzzle.TimeAllowed > 0 {
		config.TimeAllowed = puzzle.TimeAllowed
	}

	return Game{
		ID:            id,
		Score:         0,
		Attempts:      [][]uuid.UUID{},
		Correct:       []uuid.UUID{},
		Config:        config,
		Results:       []GameResult{},
		ChallengeCode: challengeCode,
		CreatedAt:     now,
		Puzzle:        puzzle,
		User:          user,
	}
}

// IsUpdateValid checks if upcoming game updates are valid
func (g *Game) IsUpdateValid(oldGame Game, user *User) bool {
	// Do some basic validation first
	if oldGame.ID != g.ID {
		return false
	}
	// If Game is already completed error out
	if oldGame.CompletedAt != nil {
		return false
	}
	// Validate Games
	if err := validate.Check(oldGame); err != nil {
		return false
	}
	if err := validate.Check(g); err != nil {
		return false
	}

	// Make sure Game belongs to User
	if !oldGame.IsUserValid(user) || !g.IsUserValid(user) {
		return false
	}

	return true
}

// IsUserValid checks whether Game belongs to User
func (g *Game) IsUserValid(user *User) bool {
	if g.User == nil && user == nil {
		return true
	} else if g.User != nil && user != nil && g.User.ID == user.ID {
		return true
	}

	return false
}

// CleanUpdate strips game of anything that shouldn't be updated and ensures that there aren't unexpected updates to game
func (g *Game) CleanUpdate(oldGame Game) {
	// Ensure these fields are not changed
	g.ChallengeCode = oldGame.ChallengeCode
	g.CreatedAt = oldGame.CreatedAt
	g.Puzzle = oldGame.Puzzle
	g.User = oldGame.User

	// Make sure Config wasn't accidentally updated if Puzzle doesn't allow it
	if oldGame.Puzzle.MaxAttempts > 0 {
		g.Config.MaxAttempts = oldGame.Config.MaxAttempts
	}
	if oldGame.Puzzle.TimeAllowed > 0 {
		g.Config.TimeAllowed = oldGame.Config.TimeAllowed
	}
	// Make sure config wasn't updated if challengedBy is set
	if oldGame.ChallengedBy != nil {
		g.Config = oldGame.Config
	}
}

func (g *Game) Validate() error {
	return validate.Check(g)
}

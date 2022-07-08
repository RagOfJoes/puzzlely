package game

import (
	"time"

	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

// Config
type Config struct {
	// MaxAttempts defines the amount of attempts a User can take to complete the game
	MaxAttempts uint16 `json:"maxAttempts" validate:"min=0,max=999"`
	// TimeAllowed defines the amount of time a User can take to complete the game
	TimeAllowed uint32 `json:"timeAllowed" validate:"min=0,max=3599000"`
}

// Result
type Result struct {
	// Guess defines User's guess
	Guess string `json:"guess" validate:"required,notblank,min=1,max=24"`
	// Correct defines whether User's guess was close to a Puzzle.Answers
	Correct bool `json:"correct" validate:"required"`
	// PuzzleGroupID defines what Puzzle.Group this guess belongs to
	PuzzleGroupID uuid.UUID `json:"groupID" validate:"required"`
}

// Game
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
	Config Config `json:"config" validate:"required"`
	// Result is the result of the User's guesses of Puzzle.Group's correlation
	Results []Result `json:"results"`
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
	ChallengedBy *Node `json:"challengedBy" validate:"omitempty,dive"`
	// Puzzle defines the puzzle that the game is for
	Puzzle puzzle.Puzzle `json:"puzzle" validate:"required,dive"`
	// User is the user that this game belongs to
	User *user.User `json:"user" validate:"omitempty,dive"`
}

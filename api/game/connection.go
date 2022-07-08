package game

import (
	"time"

	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

// Node is used for list responses
type Node struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Score defines the score for the game
	Score uint8 `json:"score" validate:"min=0,max=8"`
	// Attempts user took before GuessedAt is set
	Attempts uint8 `json:"attempts" validate:"min=0"`
	// Config is the configuration for the game that the user set
	Config Config `json:"config" validate:"required"`
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
	Puzzle puzzle.Node `json:"puzzle" validate:"required,dive"`
	// User is the user that this game belongs to
	User *user.User `json:"user" validate:"omitempty,dive"`
}

// Edge
type Edge struct {
	Cursor string `json:"cursor" validate:"required,base64"`
	Node   *Node  `json:"node" validate:"required"`
}

// PageInfo
type PageInfo struct {
	Cursor      string `json:"cursor" validate:"omitempty,base64"`
	HasNextPage bool   `json:"hasNextPage"`
}

// Connection
type Connection struct {
	Edges    []*Edge  `json:"edges" validate:"required,dive"`
	PageInfo PageInfo `json:"pageInfo" validate:"required"`
}

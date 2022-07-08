package game

import (
	"time"

	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
	"github.com/rs/xid"
)

// New creates a new Game entity
func New(puzz puzzle.Puzzle, currentUser *user.User) Game {
	id := uuid.New()
	now := time.Now()
	challengeCode := xid.New().String()

	// Setup Config
	config := Config{}
	// First configure based on difficulty
	switch puzz.Difficulty {
	case puzzle.Hard:
		config.MaxAttempts = 12
		// 3 minutes
		config.TimeAllowed = 180000
	case puzzle.Medium:
		config.MaxAttempts = 18
		// 5 minutes
		config.TimeAllowed = 300000
	default:
		config.MaxAttempts = 24
		// 10 minutes
		config.TimeAllowed = 600000
	}
	// If Puzzle doesn't allow for it then use Puzzle's settings
	if puzz.MaxAttempts > 0 {
		config.MaxAttempts = puzz.MaxAttempts
	}
	if puzz.TimeAllowed > 0 {
		config.TimeAllowed = puzz.TimeAllowed
	}

	return Game{
		ID:            id,
		Score:         0,
		Attempts:      [][]uuid.UUID{},
		Correct:       []uuid.UUID{},
		Config:        config,
		Results:       []Result{},
		ChallengeCode: challengeCode,
		CreatedAt:     now,
		Puzzle:        puzz,
		User:          currentUser,
	}
}

// IsUserValid checks whether Game belongs to User
func (g *Game) IsUserValid(user *user.User) bool {
	if g.User == nil && user == nil {
		return true
	} else if g.User != nil && user != nil && g.User.ID == user.ID {
		return true
	}

	return false
}

// Node transforms Game to Node
func (g *Game) Node() Node {
	attempts := (uint8)(len(g.Attempts))
	return Node{
		ID:            g.ID,
		Score:         g.Score,
		Attempts:      attempts,
		Config:        g.Config,
		ChallengeCode: g.ChallengeCode,
		CreatedAt:     g.CreatedAt,
		StartedAt:     g.StartedAt,
		GuessedAt:     g.GuessedAt,
		CompletedAt:   g.CompletedAt,
		Puzzle:        g.Puzzle.Node(),
		User:          g.User,
	}
}

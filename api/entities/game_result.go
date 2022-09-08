package entities

import (
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*GameResult)(nil)

// GameResult defines the result of a game
type GameResult struct {
	// Guess defines User's guess
	Guess string `json:"guess" validate:"required,notblank,min=1,max=24"`
	// Correct defines whether User's guess was close to a Puzzle.Answers
	Correct bool `json:"correct" validate:"required"`
	// PuzzleGroupID defines what Puzzle.Group this guess belongs to
	PuzzleGroupID uuid.UUID `json:"groupID" validate:"required"`
}

func (g *GameResult) Validate() error {
	return validate.Check(g)
}

package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
)

var _ Entity = (*PuzzleNode)(nil)

// PuzzleNode defines a summarized version of a puzzle
type PuzzleNode struct {
	Base

	// Name defines the name of the puzzle
	Name string `json:"name" validate:"required,notblank,alphanumspace,min=1,max=64"`
	// Description can be used as hints, red herrings, etc.
	Description string `json:"description,omitempty" validate:"printasciiextra,max=512"`
	// Difficulty of the connection between blocks
	Difficulty PuzzleDifficulty `json:"difficulty" validate:"required,oneof='Easy' 'Medium' 'Hard'"`
	// MaxAttempts limits how a user can configure their game when playing the puzzle
	//
	// If 0, users will be able to customize their game's maxAttempt config
	MaxAttempts uint16 `json:"maxAttempts" validate:"min=0,max=999"`
	// TimeAllowed limits how a user can configure their game when playing the puzzle
	//
	// If 0, users will be able to customize their game's timeAllowed config
	TimeAllowed uint32 `json:"timeAllowed" validate:"min=0,max=3599000"`
	// LikedAt defines when or if a user has like the puzzle
	LikedAt *time.Time `json:"likedAt"`
	// NumOfLikes defines the number of likes of the puzzle
	NumOfLikes uint `json:"numOfLikes"`
	// CreatedBy defines the user that created the puzzle
	CreatedBy User `json:"createdBy" validate:"required"`
}

func (p *PuzzleNode) Validate() error {
	return validate.Check(p)
}

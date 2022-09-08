package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*Puzzle)(nil)

// PuzzleDifficulty defines the difficulty options for a puzzle
type PuzzleDifficulty string

const (
	Easy   PuzzleDifficulty = "Easy"
	Medium PuzzleDifficulty = "Medium"
	Hard   PuzzleDifficulty = "Hard"
)

// Puzzle defines a puzzle
type Puzzle struct {
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
	// Groups that belong to this puzzle
	Groups []PuzzleGroup `json:"groups" validate:"required,len=4,dive"`
	// CreatedBy defines the user that created the puzzle
	CreatedBy User `json:"createdBy" validate:"required"`
}

// NewPuzzle creates a new puzzle for a given user
func NewPuzzle(name, description string, difficulty PuzzleDifficulty, maxAttempts uint16, timeAllowed uint32, groups []PuzzleGroup, createdBy User) Puzzle {
	return Puzzle{
		Base: Base{
			ID:        uuid.New(),
			CreatedAt: time.Now(),
		},

		Name:        name,
		Description: description,
		Difficulty:  difficulty,
		MaxAttempts: maxAttempts,
		TimeAllowed: timeAllowed,
		Groups:      groups,
		CreatedBy:   createdBy,
	}
}

func (p *Puzzle) Validate() error {
	return validate.Check(p)
}

package puzzle

import (
	"time"

	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

// Block
type Block struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Value is the text that will be rendered on the ui
	Value string `json:"value" validate:"required,notblank,printascii,min=1,max=48"`
	// GroupID is the unique identifier of the Group that this Block belongs to
	GroupID uuid.UUID `json:"groupID" validate:"required"`
}

// Group
type Group struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Description for the group, this can explain the connection further, fun facts, etc.
	Description string `json:"description" validate:"required,notblank,printascii,max=512"`
	// Answers is an array of string fragments that will compare user guess to check if it's correct
	Answers []string `json:"answers" validate:"required,min=1,max=8,dive,required,notblank,alphanum,min=1,max=24"`
	// Blocks that belong to this group
	Blocks []Block `json:"blocks" validate:"required,len=4,dive"`
}

type Difficulty string

var (
	Easy   Difficulty = "Easy"
	Medium Difficulty = "Medium"
	Hard   Difficulty = "Hard"
)

// Puzzle
type Puzzle struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Name
	Name string `json:"name" validate:"required,notblank,alphanumspace,min=1,max=64"`
	// Description
	Description string `json:"description,omitempty" validate:"printascii,max=512"`
	// Difficulty
	Difficulty Difficulty `json:"difficulty" validate:"required,oneof='Easy' 'Medium' 'Hard'"`
	// MaxAttempts
	MaxAttempts uint16 `json:"maxAttempts" validate:"min=0,max=999"`
	// TimeAllowed
	TimeAllowed uint32 `json:"timeAllowed" validate:"min=0,max=3599000"`
	// CreatedAt is self-explanatory
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// UpdatedAt is self-explanatory
	UpdatedAt *time.Time `json:"updatedAt"`
	// LikedAt
	LikedAt *time.Time `json:"likedAt"`
	// NumOfLikes
	NumOfLikes uint `json:"numOfLikes"`
	// Groups
	Groups []Group `json:"groups" validate:"required,len=4,dive"`
	// CreatedBy
	CreatedBy user.User `json:"createdBy" validate:"required"`
}

// Like
type Like struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Active is self-explanatory
	Active bool `json:"active" validate:"required"`
	// CreatedAt is self-explanatory
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// UpdatedAt is self-explanatory
	UpdatedAt *time.Time `json:"updatedAt"`
}

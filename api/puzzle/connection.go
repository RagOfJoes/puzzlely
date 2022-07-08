package puzzle

import (
	"time"

	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

// Node is used for list responses
type Node struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Name
	Name string `json:"name" validate:"required,notblank,alphanumspace,min=1,max=64"`
	// Description
	Description string `json:"description,omitempty" validate:"printascii,max=512"`
	// Difficulty
	Difficulty Difficulty `json:"difficulty" validate:"required,oneof='Easy' 'Medium' 'Hard'"`
	// MaxAttempts
	MaxAttempts uint16 `json:"maxAttempts"`
	// TimeAllowed
	TimeAllowed uint32 `json:"timeAllowed"`
	// NumOfLikes
	NumOfLikes uint `json:"numOfLikes"`
	// LikedAt
	LikedAt *time.Time `json:"likedAt"`
	// CreatedAt is self-explanatory
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// UpdatedAt is self-explanatory
	UpdatedAt *time.Time `json:"updatedAt"`
	// CreatedBy
	CreatedBy user.User `json:"createdBy" validate:"required"`
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

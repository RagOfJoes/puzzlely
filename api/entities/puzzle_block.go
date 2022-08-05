package entities

import (
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*PuzzleBlock)(nil)

// PuzzleBlock defines a puzzle block
type PuzzleBlock struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Value is the text that will be rendered on the ui
	Value string `json:"value" validate:"required,notblank,printasciiextra,min=1,max=48"`
	// GroupID is the unique identifier of the Group that this Block belongs to
	GroupID uuid.UUID `json:"groupID" validate:"required"`
}

// NewBlock creates a new block for a given group
func NewBlock(value string, groupID uuid.UUID) PuzzleBlock {
	return PuzzleBlock{
		ID:      uuid.New(),
		Value:   value,
		GroupID: groupID,
	}
}

func (b *PuzzleBlock) Validate() error {
	return validate.Check(b)
}

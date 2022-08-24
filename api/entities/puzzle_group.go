package entities

import (
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*PuzzleGroup)(nil)

// PuzzleGroup defines a puzzle group
type PuzzleGroup struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Description for the group, this can explain the connection further, fun facts, etc.
	Description string `json:"description" validate:"required,notblank,printasciiextra,max=512"`
	// Answers is an array of string fragments that will compare user guess to check if it's correct
	Answers []string `json:"answers" validate:"required,min=1,max=8,dive,required,notblank,alphanum,min=1,max=24"`
	// Blocks that belong to this group
	Blocks []PuzzleBlock `json:"blocks" validate:"required,len=4,dive"`
}

// NewGroup creates a new group
func NewGroup(description string, answers []string, blocks []PuzzleBlock) PuzzleGroup {
	id := uuid.New()

	newBlocks := make([]PuzzleBlock, 0, len(blocks))
	for _, block := range blocks {
		newBlock := block
		newBlock.GroupID = id

		newBlocks = append(newBlocks, newBlock)
	}

	return PuzzleGroup{
		ID:          id,
		Description: description,
		Answers:     answers,
		Blocks:      newBlocks,
	}
}

func (p *PuzzleGroup) Validate() error {
	return validate.Check(p)
}

package entities

import (
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*Group)(nil)

type Group struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Description for the group, this can explain the connection further, fun facts, etc.
	Description string `json:"description" validate:"required,notblank,printasciiextra,max=512"`
	// Answers is an array of string fragments that will compare user guess to check if it's correct
	Answers []string `json:"answers" validate:"required,min=1,max=8,dive,required,notblank,alphanum,min=1,max=24"`
	// Blocks that belong to this group
	Blocks []Block `json:"blocks" validate:"required,len=4,dive"`
}

// NewGroup creates a new group
func NewGroup(description string, answers []string, blocks []Block) Group {
	id := uuid.New()

	newBlocks := make([]Block, 0, len(blocks))
	for _, block := range blocks {
		newBlock := block
		newBlock.GroupID = id

		newBlocks = append(newBlocks, newBlock)
	}

	return Group{
		ID:          id,
		Description: description,
		Answers:     answers,
		Blocks:      newBlocks,
	}
}

func (g *Group) Validate() error {
	return validate.Check(g)
}

package entities

import "github.com/RagOfJoes/puzzlely/internal/validate"

var _ Entity = (*PuzzleFilters)(nil)

// PuzzleFilters defines valid filters for puzzles
type PuzzleFilters struct {
	CustomizableAttempts *bool             `json:"customizableAttempts" validate:"omitempty"`
	CustomizableTime     *bool             `json:"customizableTime" validate:"omitempty"`
	Difficulty           *PuzzleDifficulty `json:"difficulty" validate:"omitempty,oneof='Easy' 'Medium' 'Hard'"`
	NumOfLikes           *uint16           `json:"numofLikes" validate:"omitempty,min=0,max=999"`
}

func (p *PuzzleFilters) Validate() error {
	return validate.Check(p)
}

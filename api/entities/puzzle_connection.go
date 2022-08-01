package entities

import "github.com/RagOfJoes/puzzlely/internal/validate"

var _ Entity = (*PuzzleConnection)(nil)

// PuzzleConnection defines a paginated list of puzzles
type PuzzleConnection struct {
	Edges    []PuzzleEdge `json:"edges" validate:"required,dive"`
	PageInfo PageInfo     `json:"pageInfo" validate:"required"`
}

func (p *PuzzleConnection) Validate() error {
	return validate.Check(p)
}

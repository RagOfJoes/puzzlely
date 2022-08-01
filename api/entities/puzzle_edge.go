package entities

import "github.com/RagOfJoes/puzzlely/internal/validate"

var _ Entity = (*PuzzleEdge)(nil)

// PuzzleEdge defines a paginated puzzle list item
type PuzzleEdge struct {
	Cursor string     `json:"cursor" validate:"required,base64"`
	Node   PuzzleNode `json:"node" validate:"required,dive"`
}

func (p *PuzzleEdge) Validate() error {
	return validate.Check(p)
}

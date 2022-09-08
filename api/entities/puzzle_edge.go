package entities

import (
	"github.com/RagOfJoes/puzzlely/internal/validate"
)

var _ Entity = (*PuzzleEdge)(nil)

// PuzzleEdge defines a paginated puzzle list item
type PuzzleEdge struct {
	Cursor Cursor     `json:"cursor" validate:"required"`
	Node   PuzzleNode `json:"node" validate:"required,dive"`
}

func (p *PuzzleEdge) Validate() error {
	if p.Cursor.Empty() {
		return ErrCursorInvalid
	}
	if err := p.Cursor.Validate(); err != nil {
		return err
	}

	return validate.Check(p)
}

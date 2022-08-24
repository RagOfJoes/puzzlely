package entities

import (
	"github.com/RagOfJoes/puzzlely/internal/validate"
)

var _ Entity = (*GameEdge)(nil)

type GameEdge struct {
	Cursor Cursor   `json:"cursor" validate:"required"`
	Node   GameNode `json:"node" validate:"required,dive"`
}

func (g *GameEdge) Validate() error {
	if g.Cursor.Empty() {
		return ErrCursorInvalid
	}
	if err := g.Cursor.Validate(); err != nil {
		return err
	}

	return validate.Check(g)
}

package entities

import "github.com/RagOfJoes/puzzlely/internal/validate"

var _ Entity = (*GameEdge)(nil)

type GameEdge struct {
	Cursor string   `json:"cursor" validate:"required,base64"`
	Node   GameNode `json:"node" validate:"required,dive"`
}

func (g *GameEdge) Validate() error {
	return validate.Check(g)
}

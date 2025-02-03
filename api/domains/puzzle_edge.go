package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*PuzzleEdge)(nil)

// PuzzleEdge defines a paginated puzzle list item
type PuzzleEdge struct {
	Cursor Cursor `json:"cursor"`
	Node   Puzzle `json:"node"`
}

func (p PuzzleEdge) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Cursor, validation.Required),
		validation.Field(&p.Node, validation.Required),
	)
}

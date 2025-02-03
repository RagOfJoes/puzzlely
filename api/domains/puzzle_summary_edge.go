package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*PuzzleSummaryEdge)(nil)

// PuzzleEdge defines a paginated puzzle list item
type PuzzleSummaryEdge struct {
	Cursor Cursor        `json:"cursor"`
	Node   PuzzleSummary `json:"node"`
}

func (p PuzzleSummaryEdge) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Cursor, validation.Required),
		validation.Field(&p.Node, validation.Required),
	)
}

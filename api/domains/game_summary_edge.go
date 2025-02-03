package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*GameSummaryEdge)(nil)

// GameEdge defines a paginated puzzle list item
type GameSummaryEdge struct {
	Cursor Cursor      `json:"cursor"`
	Node   GameSummary `json:"node"`
}

func (g GameSummaryEdge) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.Cursor, validation.Required),
		validation.Field(&g.Node, validation.Required),
	)
}

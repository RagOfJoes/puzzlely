package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*GameEdge)(nil)

// GameEdge defines a paginated puzzle list item
type GameEdge struct {
	Cursor Cursor      `json:"cursor"`
	Node   GameSummary `json:"node"`
}

func (p GameEdge) Validate() error {
	if p.Cursor.IsEmpty() {
		return ErrCursorInvalid
	}
	if err := p.Cursor.Validate(); err != nil {
		return err
	}

	return validation.ValidateStruct(&p,
		validation.Field(&p.Cursor, validation.Required),
		validation.Field(&p.Node, validation.Required),
	)
}

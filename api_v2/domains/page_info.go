package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*PageInfo)(nil)

// PageInfo defines pagination metadata
type PageInfo struct {
	HasNextPage     bool   `json:"has_next_page"`
	HasPreviousPage bool   `json:"has_previous_page"`
	NextCursor      Cursor `json:"next_cursor"`
	PreviousCursor  Cursor `json:"previous_cursor"`
}

func (p PageInfo) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.HasNextPage),
		validation.Field(&p.HasPreviousPage),
		validation.Field(&p.NextCursor),
		validation.Field(&p.PreviousCursor),
	)
}

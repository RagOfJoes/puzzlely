package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*PageInfo)(nil)

// PageInfo defines pagination metadata
type PageInfo struct {
	Cursor      Cursor `json:"cursor"`
	HasNextPage bool   `json:"has_next_page"`
}

func (p PageInfo) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Cursor),
		validation.Field(&p.HasNextPage),
	)
}

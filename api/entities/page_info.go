package entities

import "github.com/RagOfJoes/puzzlely/internal/validate"

var _ Entity = (*PageInfo)(nil)

// PageInfo defines pagination metadata
type PageInfo struct {
	Cursor      string `json:"cursor" validate:"omitempty,base64"`
	HasNextPage bool   `json:"hasNextPage"`
}

func (p *PageInfo) Validate() error {
	return validate.Check(p)
}

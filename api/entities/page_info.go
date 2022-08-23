package entities

import "github.com/RagOfJoes/puzzlely/internal/validate"

var _ Entity = (*PageInfo)(nil)

// PageInfo defines pagination metadata
type PageInfo struct {
	Cursor      Cursor `json:"cursor"`
	HasNextPage bool   `json:"hasNextPage"`
}

func (p *PageInfo) Validate() error {
	if err := p.Cursor.Validate(); err != nil {
		return err
	}

	return validate.Check(p)
}

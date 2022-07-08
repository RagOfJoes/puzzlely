package pagination

import (
	"fmt"

	"github.com/RagOfJoes/puzzlely/internal"
)

type Params struct {
	Cursor    string
	Limit     int
	SortKey   string
	SortOrder string
}

func (p *Params) Validate(sortKeyMap map[string]string) error {
	cursor := p.Cursor
	limit := p.Limit
	sortOrder := p.SortOrder

	// Set default value for sort key
	sortKey := p.SortKey
	if sortKey == "" {
		sortKey = "created_at"
	}

	// Validate cursor
	if cursor != "" {
		decoded, err := DecodeCursor(cursor)
		if err != nil {
			return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrInvalidCursor)
		}
		p.Cursor = *decoded
	}
	// Validate sort key
	if sortKeyMap[sortKey] == "" {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, fmt.Sprintf("%v is not a valid key.", sortKey))
	}

	// Validate sort order
	if sortOrder != "ASC" && sortOrder != "DESC" {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrInvalidOrder)
	}
	if limit < 1 || limit > 100 {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrInvalidLimit)
	}

	p.Limit = limit
	p.SortKey = sortKeyMap[sortKey]
	p.SortOrder = sortOrder

	return nil
}

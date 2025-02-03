package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*PuzzleCursorPaginationOpts)(nil)

type PuzzleCursorPaginationOpts struct {
	Cursor    Cursor `json:"-"`
	Direction string `json:"-"`
	Limit     int    `json:"-"`
}

func (p PuzzleCursorPaginationOpts) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Cursor),
		validation.Field(&p.Direction, validation.In("B", "F")),
		validation.Field(&p.Limit, validation.Min(1), validation.Max(99)),
	)
}

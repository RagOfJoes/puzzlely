package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

var _ Domain = (*GameCursorPaginationOpts)(nil)

type GameCursorPaginationOpts struct {
	Cursor Cursor `json:"-"`
	Limit  int    `json:"-"`
}

func (g GameCursorPaginationOpts) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.Cursor),
		validation.Field(&g.Limit, validation.Min(1), validation.Max(99)),
	)
}

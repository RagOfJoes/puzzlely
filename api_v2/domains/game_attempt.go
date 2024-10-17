package domains

import (
	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var _ Domain = (*GameAttempt)(nil)

type GameAttempt struct {
	ID             string `bun:"type:varchar(26),pk,notnull" json:"-"`
	AttemptOrder   uint16 `bun:",notnull" json:"-"`
	SelectionOrder uint16 `bun:",notnull" json:"-"`

	PuzzleBlockID string `bun:"type:varchar(26),notnull" json:"-"`
	GameID        string `bun:"type:varchar(26),notnull" json:"-"`
}

func (g GameAttempt) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.AttemptOrder, validation.Min(0)),
		validation.Field(&g.SelectionOrder, validation.Required, validation.Min(0), validation.Max(3)),

		validation.Field(&g.PuzzleBlockID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.GameID, validation.Required, validation.By(internal.IsULID)),
	)
}

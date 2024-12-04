package domains

import (
	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var _ Domain = (*GameCorrect)(nil)

type GameCorrect struct {
	ID    string `bun:"type:varchar(26),pk,notnull" json:"-"`
	Order int    `bun:",notnull" json:"-"`

	PuzzleGroupID string `bun:"type:varchar(26),notnull" json:"-"`
	GameID        string `bun:"type:varchar(26),notnull" json:"-"`
}

func (g GameCorrect) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.Order, validation.Max(3), validation.Min(0)),

		validation.Field(&g.PuzzleGroupID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.GameID, validation.Required, validation.By(internal.IsULID)),
	)
}

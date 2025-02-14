package domains

import (
	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/uptrace/bun"
)

var _ Domain = (*PuzzleBlock)(nil)

type PuzzleBlock struct {
	bun.BaseModel

	ID    string `bun:"type:varchar(26),pk,notnull" json:"id"`
	Value string `bun:"type:varchar(48),notnull" json:"value"`

	PuzzleGroupID string `bun:"type:varchar(26),notnull" json:"puzzle_group_id"`
}

func (p PuzzleBlock) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.Value, validation.Required, validation.Length(1, 48), is.PrintableASCII),

		validation.Field(&p.PuzzleGroupID, validation.Required, validation.By(internal.IsULID)),
	)
}

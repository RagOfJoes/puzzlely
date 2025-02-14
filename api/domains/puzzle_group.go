package domains

import (
	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/uptrace/bun"
)

var _ Domain = (*PuzzleGroup)(nil)

type PuzzleGroup struct {
	bun.BaseModel

	ID          string        `bun:"type:varchar(26),pk,notnull" json:"id"`
	Description string        `bun:"type:varchar(512),notnull" json:"description"`
	Blocks      []PuzzleBlock `bun:"rel:has-many,join:id=puzzle_group_id" json:"blocks"`

	PuzzleID string `bun:"type:varchar(26),notnull,unique:puzzle_groups_unique_idx" json:"-"`
}

func (p PuzzleGroup) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.Description, validation.Required, validation.Length(1, 512), is.PrintableASCII),
		validation.Field(&p.Blocks, validation.Required, validation.Length(4, 4), validation.Each(validation.Required)),

		validation.Field(&p.PuzzleID, validation.Required, validation.By(internal.IsULID)),
	)
}

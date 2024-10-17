package domains

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/uptrace/bun"
)

var _ Domain = (*PuzzleLike)(nil)

type PuzzleLike struct {
	bun.BaseModel

	ID     string `bun:"type:varchar(26),pk,notnull" json:"id"`
	Active bool   `bun:"type:bool,notnull,default:TRUE" json:"active"`

	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	PuzzleID string `bun:"type:varchar(26),notnull" json:"-"`
	UserID   string `bun:"type:varchar(26),notnull" json:"-"`
}

func (p PuzzleLike) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.Active, validation.Required),

		validation.Field(&p.CreatedAt, validation.Required),
		validation.Field(&p.UpdatedAt, validation.Required, validation.Max(p.CreatedAt)),

		validation.Field(&p.PuzzleID, validation.Required, validation.By(internal.IsULID)),
	)
}

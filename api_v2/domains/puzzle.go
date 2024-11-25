package domains

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/uptrace/bun"
)

var _ Domain = (*Puzzle)(nil)

type Puzzle struct {
	bun.BaseModel

	ID          string `bun:"type:varchar(26),pk,notnull" json:"id"`
	Difficulty  string `bun:"type:varchar(12),default:'EASY',notnull" json:"difficulty"`
	MaxAttempts int16  `bun:",notnull" json:"max_attempts"`

	Groups []PuzzleGroup `bun:"rel:has-many,join:id=puzzle_id" json:"groups"`

	LikedAt    bun.NullTime `bun:",scanonly" json:"liked_at"`
	NumOfLikes int          `bun:",scanonly" json:"num_of_likes"`

	CreatedAt time.Time    `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt bun.NullTime `bun:",nullzero,default:NULL" json:"updated_at"`
	DeletedAt bun.NullTime `bun:",soft_delete,nullzero,default:NULL" json:"-"`

	UserID    string `bun:"type:varchar(26),notnull" json:"-"`
	CreatedBy User   `bun:"rel:belongs-to,join:user_id=id" json:"created_by"`
}

func (p Puzzle) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.Difficulty, validation.Required, validation.In("EASY", "MEDIUM", "HARD")),
		validation.Field(&p.MaxAttempts, validation.Required, validation.Min(1), validation.Max(999)),

		validation.Field(&p.Groups, validation.Required, validation.Length(4, 4), validation.Each(validation.Required)),

		validation.Field(&p.LikedAt, validation.When(!p.LikedAt.IsZero(), validation.By(internal.IsAfter(p.CreatedAt)))),
		validation.Field(&p.NumOfLikes, validation.Min(0)),

		validation.Field(&p.CreatedAt, validation.Required),
		validation.Field(&p.UpdatedAt, validation.When(!p.UpdatedAt.IsZero(), validation.By(internal.IsAfter(p.CreatedAt)))),
		validation.Field(&p.DeletedAt, validation.When(!p.DeletedAt.IsZero(), validation.By(internal.IsAfter(p.CreatedAt)))),

		validation.Field(&p.UserID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.CreatedBy, validation.Required),
	)
}

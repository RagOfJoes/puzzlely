package domains

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/uptrace/bun"
)

var _ Domain = (*PuzzleSummary)(nil)

type PuzzleSummary struct {
	bun.BaseModel `bun:"table:puzzles"`

	ID          string `bun:"type:varchar(26),pk,notnull" json:"id"`
	Difficulty  string `bun:"type:varchar(12),default:'EASY',notnull" json:"difficulty"`
	MaxAttempts int16  `bun:",notnull" json:"max_attempts"`

	// MeLikedAt defines when and if the currently authenticated user has liked this puzzle
	MeLikedAt  bun.NullTime `bun:",scanonly" json:"me_liked_at"`
	NumOfLikes int          `bun:",scanonly" json:"num_of_likes"`
	// UserLikedAt defines when and if another user has liked this puzzle. This is primarily for viewing a user's liked puzzles
	UserLikedAt bun.NullTime `bun:",scanonly" json:"user_liked_at"`

	CreatedAt time.Time    `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt bun.NullTime `bun:",nullzero,default:NULL" json:"updated_at"`
	DeletedAt bun.NullTime `bun:",soft_delete,nullzero,default:NULL" json:"-"`

	UserID    string `bun:"type:varchar(26),notnull" json:"-"`
	CreatedBy User   `bun:"rel:belongs-to,join:user_id=id" json:"created_by"`
}

func (p PuzzleSummary) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.Difficulty, validation.Required, validation.In("EASY", "MEDIUM", "HARD")),
		validation.Field(&p.MaxAttempts, validation.Required, validation.Min(1), validation.Max(999)),

		validation.Field(&p.MeLikedAt, validation.When(!p.MeLikedAt.IsZero(), validation.By(internal.IsAfter(p.CreatedAt)))),
		validation.Field(&p.NumOfLikes, validation.Min(0)),
		validation.Field(&p.UserLikedAt, validation.When(!p.UserLikedAt.IsZero(), validation.By(internal.IsAfter(p.CreatedAt)))),

		validation.Field(&p.CreatedAt, validation.Required),
		validation.Field(&p.UpdatedAt, validation.When(!p.UpdatedAt.IsZero(), validation.By(internal.IsAfter(p.CreatedAt)))),
		validation.Field(&p.DeletedAt, validation.When(!p.DeletedAt.IsZero(), validation.By(internal.IsAfter(p.CreatedAt)))),

		validation.Field(&p.UserID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.CreatedBy, validation.Required),
	)
}

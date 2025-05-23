package domains

import (
	"database/sql"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/uptrace/bun"
)

var _ Domain = (*GameSummary)(nil)

type GameSummary struct {
	bun.BaseModel `bun:"table:games"`

	ID       string `bun:"type:varchar(26),pk,notnull" json:"id"`
	Score    int8   `bun:",notnull" json:"score"`
	Attempts int16  `bun:",scanonly" json:"attempts"`

	CreatedAt   time.Time    `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	CompletedAt bun.NullTime `bun:",nullzero,default:NULL" json:"completed_at"`

	PuzzleID string         `bun:"type:varchar(26),notnull" json:"-"`
	Puzzle   PuzzleSummary  `bun:"rel:has-one,join:puzzle_id=id" json:"puzzle"`
	UserID   sql.NullString `bun:"type:varchar(26)" json:"-"`
	User     *User          `bun:"rel:belongs-to,join:user_id=id" json:"user"`
}

func (g GameSummary) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.Score, validation.Max(int8(4)), validation.Min(int8(0))),
		validation.Field(&g.Attempts, validation.Max(g.Puzzle.MaxAttempts), validation.Min(int16(0))),

		validation.Field(&g.CreatedAt, validation.Required),

		validation.Field(&g.PuzzleID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.Puzzle, validation.Required),

		validation.Field(&g.UserID, validation.When(g.UserID.Valid, validation.By(internal.IsULID))),
		validation.Field(&g.User, validation.When(g.User != nil, validation.Required)),
	)
}

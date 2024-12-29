package domains

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/oklog/ulid/v2"
	"github.com/uptrace/bun"
)

var _ Domain = (*Game)(nil)

type Game struct {
	bun.BaseModel

	ID       string     `bun:"type:varchar(26),pk,notnull" json:"id"`
	Score    int8       `bun:",notnull" json:"score"`
	Attempts [][]string `bun:"-" json:"attempts"`
	Correct  []string   `bun:"-" json:"correct"`

	CreatedAt   time.Time    `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	CompletedAt bun.NullTime `bun:",nullzero,default:NULL" json:"completed_at"`

	PuzzleID string `bun:"type:varchar(26),notnull" json:"-"`
	Puzzle   Puzzle `bun:"rel:has-one,join:puzzle_id=id" json:"puzzle"`
	UserID   string `bun:"type:varchar(26),notnull" json:"-"`
	User     User   `bun:"rel:belongs-to,join:user_id=id" json:"user"`
}

func NewGame() Game {
	return Game{
		ID:       ulid.Make().String(),
		Score:    0,
		Attempts: make([][]string, 0),
		Correct:  make([]string, 0),

		CreatedAt: time.Now(),
	}
}

func (g *Game) Complete(atttemps [][]string, correct []string) {
	g.Score = int8(len(correct))
	g.Attempts = atttemps
	g.Correct = correct

	g.CompletedAt = bun.NullTime{
		Time: time.Now(),
	}
}

// IsAhead checks whether the current `Game` is ahead of the given `Game`
func (g Game) IsAhead(of Game) bool {
	if !g.CompletedAt.IsZero() && of.CompletedAt.IsZero() {
		return true
	}

	return len(g.Attempts) >= len(of.Attempts)
}

func (g Game) Validate() error {
	blocks := make([]interface{}, 0)
	groups := make([]interface{}, 0)
	for _, group := range g.Puzzle.Groups {
		groups = append(groups, group.ID)

		for _, block := range group.Blocks {
			blocks = append(blocks, block.ID)
		}
	}

	return validation.ValidateStruct(&g,
		validation.Field(&g.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.Score, validation.Min(int8(len(g.Correct))), validation.Max(int8(len(g.Correct)))),
		validation.Field(&g.Attempts, validation.Each(validation.Required, validation.Length(4, 4), validation.Each(validation.In(blocks...)))),
		validation.Field(&g.Correct, validation.Length(0, 4), validation.Each(validation.In(groups...))),

		validation.Field(&g.CreatedAt, validation.Required),

		validation.Field(&g.PuzzleID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.Puzzle, validation.Required),

		validation.Field(&g.UserID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.User, validation.Required),
	)
}

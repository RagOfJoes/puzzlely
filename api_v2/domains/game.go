package domains

import (
	"database/sql"
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
	Score    uint8      `bun:",notnull" json:"score"`
	Attempts [][]string `bun:"-" json:"attempts"`
	Correct  []string   `bun:"-" json:"correct"`

	CreatedAt   time.Time    `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	CompletedAt bun.NullTime `bun:",nullzero,default:NULL" json:"completed_at"`

	PuzzleID string         `bun:"type:varchar(26),notnull" json:"-"`
	Puzzle   Puzzle         `bun:"rel:has-one,join:puzzle_id=id" json:"puzzle"`
	UserID   sql.NullString `bun:"type:varchar(26)" json:"-"`
	User     *User          `bun:"rel:belongs-to,join:user_id=id" json:"user"`
}

func NewGame(puzzle Puzzle, user *User) Game {
	newGame := Game{
		ID:       ulid.Make().String(),
		Score:    0,
		Attempts: make([][]string, 0),
		Correct:  make([]string, 0),

		CreatedAt: time.Now(),

		PuzzleID: puzzle.ID,
		Puzzle:   puzzle,
	}

	if user != nil {
		newGame.UserID = sql.NullString{
			String: user.ID,
			Valid:  true,
		}
		newGame.User = user
		return newGame
	}

	return newGame
}

// TODO: Validate the attempts and correct
func (g *Game) Complete(atttemps [][]string, correct []string) {
	g.Score = uint8(len(correct))
	g.Attempts = atttemps
	g.Correct = correct

	g.CompletedAt = bun.NullTime{
		Time: time.Now(),
	}
}

func (g Game) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.Score, validation.Min(uint8(len(g.Correct))), validation.Max(uint8(len(g.Correct)))),
		validation.Field(&g.Attempts, validation.Each(validation.Required, validation.Length(4, 4))),
		validation.Field(&g.Correct, validation.Length(0, 4)),

		validation.Field(&g.CreatedAt, validation.Required),
		validation.Field(&g.CompletedAt, validation.When(!g.CompletedAt.IsZero(), validation.By(internal.IsAfter(g.CreatedAt)))),

		validation.Field(&g.PuzzleID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&g.Puzzle, validation.Required),

		validation.Field(&g.UserID, validation.When(g.UserID.Valid, validation.By(internal.IsULID))),
		validation.Field(&g.User, validation.When(g.User != nil, validation.Required)),
	)
}

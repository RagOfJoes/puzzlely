package domains

import (
	"slices"
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

	return len(g.Attempts) > len(of.Attempts)
}

// IsContinuation checks whether the given `Game` has the same attempts, correct, and, score as the current `Game`
func (g Game) IsContinuation(other Game) bool {
	// Ensure that the given game's attempts length is greater than or equal to the current game
	if len(other.Attempts) < len(g.Attempts) {
		return false
	}
	// Ensure that the given game's correct length is greater than or equal to the current game
	if len(other.Correct) < len(g.Correct) {
		return false
	}
	// Ensure that the given game's score is greater than or equal to the current game
	if other.Score < g.Score {
		return false
	}

	// Make sure that the given game has all the previous attempts from the current game
	for i, attempt := range g.Attempts {
		// Will ideally never happen but double check just to make sure
		if i >= len(other.Attempts) {
			return false
		}

		other := other.Attempts[i]
		if !slices.Equal(attempt, other) {
			return false
		}
	}

	// Make sure that the given game has all the previous correct from the current game
	for i, correct := range g.Correct {
		// Will ideally never happen but double check just to make sure
		if i >= len(other.Correct) {
			return false
		}

		other := other.Correct[i]
		if other != correct {
			return false
		}
	}

	return true
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

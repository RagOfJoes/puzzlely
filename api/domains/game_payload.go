package domains

import (
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/go-chi/render"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/uptrace/bun"
)

var _ Domain = (*GamePayload)(nil)
var _ render.Binder = (*GamePayload)(nil)

type GamePayload struct {
	Score    int8       `bun:",notnull" json:"score"`
	Attempts [][]string `bun:"-" json:"attempts"`
	Correct  []string   `bun:"-" json:"correct"`

	CompletedAt bun.NullTime `bun:",nullzero,default:NULL" json:"completed_at"`
}

func (g *GamePayload) Bind(r *http.Request) error {
	return nil
}

func (g GamePayload) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.Score, validation.Min(int8(len(g.Correct))), validation.Max(int8(len(g.Correct)))),
		validation.Field(&g.Attempts, validation.Each(validation.Required, validation.Length(4, 4))),
		validation.Field(&g.Correct, validation.Length(0, 4)),

		validation.Field(&g.CompletedAt, validation.When(!g.CompletedAt.IsZero(), validation.By(internal.IsBefore(time.Now())))),
	)
}

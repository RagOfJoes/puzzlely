package domains

import (
	"net/http"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/go-chi/render"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

var _ Domain = (*PuzzleUpdatePayload)(nil)
var _ render.Binder = (*PuzzleUpdatePayload)(nil)

var _ Domain = (*PuzzleUpdatePayloadGroup)(nil)

type PuzzleUpdatePayloadGroup struct {
	ID          string `json:"id"`
	Description string `json:"description"`
}

func (p PuzzleUpdatePayloadGroup) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&p.Description, validation.Required, validation.Length(1, 512), is.PrintableASCII, internal.IsSanitized, internal.IsClean),
	)
}

type PuzzleUpdatePayload struct {
	Difficulty string `json:"difficulty"`

	Groups []PuzzleUpdatePayloadGroup `json:"groups"`
}

func (p *PuzzleUpdatePayload) Bind(r *http.Request) error {
	return nil
}

func (p PuzzleUpdatePayload) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Difficulty, validation.Required, validation.In("EASY", "MEDIUM", "HARD")),

		validation.Field(&p.Groups, validation.Required, validation.Length(0, 4), validation.Each(validation.Required)),
	)
}

package domains

import (
	"net/http"
	"time"

	"github.com/go-chi/render"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/oklog/ulid/v2"
)

var _ Domain = (*PuzzleCreatePayload)(nil)
var _ render.Binder = (*PuzzleCreatePayload)(nil)

var _ Domain = (*PuzzleCreatePayloadBlock)(nil)
var _ Domain = (*PuzzleCreatePayloadGroup)(nil)

type PuzzleCreatePayloadBlock struct {
	Value string `json:"value"`
}

func (p PuzzleCreatePayloadBlock) Validate() error {
	return validation.ValidateStruct(
		validation.Field(&p.Value, validation.Required, validation.Length(1, 48), is.PrintableASCII),
	)
}

type PuzzleCreatePayloadGroup struct {
	Description string                     `json:"description"`
	Blocks      []PuzzleCreatePayloadBlock `json:"blocks"`
}

func (p PuzzleCreatePayloadGroup) Validate() error {
	return validation.ValidateStruct(
		validation.Field(&p.Description, validation.Required, validation.Length(1, 512), is.PrintableASCII),
		validation.Field(&p.Blocks, validation.Required, validation.Length(4, 4), validation.Each(validation.Required)),
	)
}

type PuzzleCreatePayload struct {
	Difficulty  string `json:"difficulty"`
	MaxAttempts uint16 `json:"max_attempts"`

	Groups []PuzzleCreatePayloadGroup `json:"groups"`
}

func (p *PuzzleCreatePayload) Bind(r *http.Request) error {
	return nil
}

func (p PuzzleCreatePayload) ToPuzzle() Puzzle {
	puzzleID := ulid.Make()

	groups := []PuzzleGroup{}
	for _, group := range p.Groups {
		groupID := ulid.Make()

		blocks := []PuzzleBlock{}
		for _, block := range group.Blocks {
			blocks = append(blocks, PuzzleBlock{
				ID:    ulid.Make().String(),
				Value: block.Value,

				PuzzleGroupID: groupID.String(),
			})
		}

		groups = append(groups, PuzzleGroup{
			ID:          groupID.String(),
			Description: group.Description,

			Blocks: blocks,

			PuzzleID: puzzleID.String(),
		})
	}

	return Puzzle{
		ID:          puzzleID.String(),
		Difficulty:  p.Difficulty,
		MaxAttempts: p.MaxAttempts,

		Groups: groups,

		CreatedAt: time.Now(),
	}
}

func (p PuzzleCreatePayload) Validate() error {
	return validation.ValidateStruct(
		validation.Field(&p.Difficulty, validation.Required, validation.In("EASY", "MEDIUM", "HARD")),
		validation.Field(&p.MaxAttempts, validation.Required, validation.Min(uint16(1)), validation.Max(uint16(999))),

		validation.Field(&p.Groups, validation.Required, validation.Length(4, 4), validation.Each(validation.Required)),
	)
}

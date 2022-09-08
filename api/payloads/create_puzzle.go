package payloads

import (
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/sanitize"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

var _ render.Binder = (*CreatePuzzle)(nil)

// CreatePuzzleBlock defines the payload required for creating a user
type CreatePuzzleBlock struct {
	Value string `json:"value" validate:"required,notblank,printasciiextra,min=1,max=48"`
}

// CreatePuzzleGroup defines the payload required for creating a user
type CreatePuzzleGroup struct {
	Answers     []string            `json:"answers" validate:"required,min=1,max=8,dive,required,notblank,alphanum,min=1,max=24"`
	Description string              `json:"description" validate:"required,notblank,printasciiextra,max=512"`
	Blocks      []CreatePuzzleBlock `json:"blocks" validate:"required,len=4,dive"`
}

// CreatePuzzleGroup defines the payload required for creating a user
type CreatePuzzle struct {
	Name        string                    `json:"name" validate:"required,notblank,alphanumspace,min=1,max=64"`
	Description string                    `json:"description" validate:"printasciiextra,max=512"`
	Difficulty  entities.PuzzleDifficulty `json:"difficulty" validate:"required,oneof='Easy' 'Medium' 'Hard'"`
	MaxAttempts uint16                    `json:"maxAttempts" validate:"min=0,max=999"`
	TimeAllowed uint32                    `json:"timeAllowed" validate:"min=0,max=3599000"`

	Groups []CreatePuzzleGroup `json:"groups" validate:"required,len=4,dive"`
}

func (c *CreatePuzzle) Bind(r *http.Request) error {
	return nil
}

func (c *CreatePuzzle) ToEntity() entities.Puzzle {
	id := uuid.New()
	now := time.Now()

	groups := []entities.PuzzleGroup{}
	for _, group := range c.Groups {
		groupID := uuid.New()
		blocks := []entities.PuzzleBlock{}
		for _, block := range group.Blocks {
			blocks = append(blocks, entities.PuzzleBlock{
				ID:      uuid.New(),
				Value:   block.Value,
				GroupID: groupID,
			})
		}
		groups = append(groups, entities.PuzzleGroup{
			ID:          groupID,
			Answers:     group.Answers,
			Description: sanitize.HTML(group.Description),
			Blocks:      blocks,
		})
	}

	return entities.Puzzle{
		Base: entities.Base{
			ID:        id,
			CreatedAt: now,
		},

		Name:        c.Name,
		Description: sanitize.HTML(c.Description),
		Difficulty:  c.Difficulty,
		MaxAttempts: c.MaxAttempts,
		TimeAllowed: c.TimeAllowed,

		Groups: groups,
	}
}

func (c *CreatePuzzle) Validate() error {
	if err := validate.Check(c); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := sanitize.IsClean(c.Name, false); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	return nil
}

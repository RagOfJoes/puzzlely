package payloads

import (
	"errors"
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/sanitize"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

// Errors
var (
	ErrPuzzleInvalidName = errors.New("Invalid puzzle name provided.")
)

var _ render.Binder = (*CreatePuzzle)(nil)
var _ render.Binder = (*UpdatePuzzle)(nil)

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

	groups := []entities.Group{}
	for _, group := range c.Groups {
		groupID := uuid.New()
		blocks := []entities.Block{}
		for _, block := range group.Blocks {
			blocks = append(blocks, entities.Block{
				ID:      uuid.New(),
				Value:   block.Value,
				GroupID: groupID,
			})
		}
		groups = append(groups, entities.Group{
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
		TimeAllowed: c.TimeAllowed,
		MaxAttempts: c.MaxAttempts,
		Groups:      groups,
	}
}

func (c *CreatePuzzle) Validate() error {
	if err := validate.Check(c); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	if err := sanitize.IsClean(c.Name, false); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidName)
	}

	return nil
}

// UpdatePuzzleGroup defines the payload required for updating a puzzle
type UpdatePuzzleGroup struct {
	ID          uuid.UUID `json:"id" validate:"required"`
	Description string    `json:"description" validate:"required,notblank,printasciiextra,max=512"`
}

// UpdatePuzzle defines the payload required for updating a puzzle
type UpdatePuzzle struct {
	Name        string                    `json:"name" validate:"omitempty,notblank,alphanumspace,min=1,max=64"`
	Description string                    `json:"description" validate:"omitempty,printasciiextra,max=512"`
	Difficulty  entities.PuzzleDifficulty `json:"difficulty" validate:"omitempty,required,oneof='Easy' 'Medium' 'Hard'"`

	Groups []UpdatePuzzleGroup `json:"groups" validate:"omitempty,dive"`
}

func (u *UpdatePuzzle) Bind(r *http.Request) error {
	return nil
}

func (u *UpdatePuzzle) ToEntity(from entities.Puzzle) entities.Puzzle {
	update := from

	if len(u.Name) > 0 {
		update.Name = u.Name
	}
	if len(u.Description) > 0 {
		update.Description = sanitize.HTML(u.Description)
	}
	if len(u.Difficulty) > 0 && u.Difficulty != from.Difficulty {
		update.Difficulty = u.Difficulty
	}
	if len(u.Groups) > 0 {
		groupMap := map[uuid.UUID]UpdatePuzzleGroup{}
		for _, group := range u.Groups {
			groupMap[group.ID] = group
		}

		var groups []entities.Group
		for _, group := range update.Groups {
			value, ok := groupMap[group.ID]
			if !ok {
				groups = append(groups, group)
				continue
			}

			update := group
			update.Description = sanitize.HTML(value.Description)

			groups = append(groups, update)
		}

		update.Groups = groups
	}

	return update
}

func (u *UpdatePuzzle) Validate() error {
	if err := validate.Check(u); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := sanitize.IsClean(u.Name, false); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalidName)
	}
	return nil
}

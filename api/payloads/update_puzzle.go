package payloads

import (
	"net/http"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/sanitize"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

var _ render.Binder = (*UpdatePuzzle)(nil)

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

		var groups []entities.PuzzleGroup
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
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	return nil
}

package api

import (
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/sanitize"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/google/uuid"
)

type CreatePuzzlePayloadBlock struct {
	Value string `json:"value" validate:"required,notblank,printascii,min=1,max=48"`
}

type CreatePuzzlePayloadGroup struct {
	Answers     []string                   `json:"answers" validate:"required,min=1,max=8,dive,required,notblank,alphanum,min=1,max=24"`
	Description string                     `json:"description" validate:"required,notblank,printascii,max=512"`
	Blocks      []CreatePuzzlePayloadBlock `json:"blocks" validate:"required,len=4,dive"`
}

type CreatePuzzlePayload struct {
	Name        string            `json:"name" validate:"required,notblank,alphanumspace,min=1,max=64"`
	Description string            `json:"description" validate:"printascii,max=512"`
	Difficulty  puzzle.Difficulty `json:"difficulty" validate:"required,oneof='Easy' 'Medium' 'Hard'"`
	MaxAttempts uint16            `json:"maxAttempts" validate:"min=0,max=999"`
	TimeAllowed uint32            `json:"timeAllowed" validate:"min=0,max=3599000"`

	Groups []CreatePuzzlePayloadGroup `json:"groups" validate:"required,len=4,dive"`
}

func (c *CreatePuzzlePayload) Bind(r *http.Request) error {
	return nil
}

func (c *CreatePuzzlePayload) Clean() *CreatePuzzlePayload {
	cleaned := *c
	cleaned.Description = sanitize.HTML(c.Description)

	groups := []CreatePuzzlePayloadGroup{}
	for _, group := range c.Groups {
		cleanedGroups := group
		cleanedGroups.Description = sanitize.HTML(group.Description)
		groups = append(groups, cleanedGroups)
	}

	cleaned.Groups = groups

	return &cleaned
}

func (c *CreatePuzzlePayload) ToEntity() puzzle.Puzzle {
	id := uuid.New()
	now := time.Now()

	groups := []puzzle.Group{}
	for _, group := range c.Groups {
		groupID := uuid.New()
		blocks := []puzzle.Block{}
		for _, block := range group.Blocks {
			blocks = append(blocks, puzzle.Block{
				ID:      uuid.New(),
				Value:   block.Value,
				GroupID: groupID,
			})
		}
		groups = append(groups, puzzle.Group{
			ID:          groupID,
			Answers:     group.Answers,
			Description: sanitize.HTML(group.Description),
			Blocks:      blocks,
		})
	}

	return puzzle.Puzzle{
		ID:          id,
		CreatedAt:   now,
		Name:        c.Name,
		Description: sanitize.HTML(c.Description),
		Difficulty:  c.Difficulty,
		TimeAllowed: c.TimeAllowed,
		MaxAttempts: c.MaxAttempts,
		Groups:      groups,
	}
}

func (c *CreatePuzzlePayload) Validate() error {
	if err := validate.Check(c); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := sanitize.IsClean(c.Name, false); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidName)
	}
	return nil
}

type UpdatePuzzlePayloadGroup struct {
	ID          uuid.UUID `json:"id" validate:"required"`
	Description string    `json:"description" validate:"required,notblank,printascii,max=512"`
}

type UpdatePuzzlePayload struct {
	Name        string            `json:"name" validate:"omitempty,notblank,alphanumspace,min=1,max=64"`
	Description string            `json:"description" validate:"omitempty,printascii,max=512"`
	Difficulty  puzzle.Difficulty `json:"difficulty" validate:"omitempty,required,oneof='Easy' 'Medium' 'Hard'"`

	Groups []UpdatePuzzlePayloadGroup `json:"groups" validate:"omitempty,dive"`
}

func (u *UpdatePuzzlePayload) Bind(r *http.Request) error {
	return nil
}

func (u *UpdatePuzzlePayload) ToEntity(from puzzle.Puzzle) puzzle.Puzzle {
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
		groupMap := map[uuid.UUID]UpdatePuzzlePayloadGroup{}
		for _, group := range u.Groups {
			groupMap[group.ID] = group
		}
		groups := []puzzle.Group{}
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

func (u *UpdatePuzzlePayload) Validate() error {
	if err := validate.Check(u); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := sanitize.IsClean(u.Name, false); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalidName)
	}
	return nil
}

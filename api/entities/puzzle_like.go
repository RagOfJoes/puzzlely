package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*PuzzleLike)(nil)

// PuzzleLike defines the metadata for a user's puzzle like
type PuzzleLike struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// Active is self-explanatory
	Active bool `json:"active" validate:"required"`
	// CreatedAt is self-explanatory
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// UpdatedAt is self-explanatory
	UpdatedAt time.Time `json:"updatedAt" validate:"required,gtfield=CreatedAt"`
}

// Toggle toggles the active field and updates the updatedAt field
func (p *PuzzleLike) Toggle() {
	p.Active = !p.Active
	p.UpdatedAt = time.Now()
}

func (p *PuzzleLike) Validate() error {
	return validate.Check(p)
}

package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

var _ Entity = (*Like)(nil)

// Like defines the metadata for a user's puzzle like
type Like struct {
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
func (l *Like) Toggle() {
	l.Active = !l.Active
	l.UpdatedAt = time.Now()
}

func (l *Like) Validate() error {
	return validate.Check(l)
}

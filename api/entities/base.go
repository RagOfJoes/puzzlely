package entities

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
)

// Entity defines common methods that all entities will have
type Entity interface {
	Validate() error
}

// Base defines common fields that will be used by most entities
type Base struct {
	// ID is the unique identifier
	ID uuid.UUID `json:"id" validate:"required"`
	// CreatedAt is self-explanatory
	CreatedAt time.Time `json:"createdAt" validate:"required"`
	// UpdatedAt is self-explanatory
	UpdatedAt *time.Time `json:"updatedAt" validate:"omitempty,gtfield=CreatedAt"`
}

func (b *Base) Validate() error {
	return validate.Check(b)
}

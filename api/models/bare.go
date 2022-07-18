package models

import (
	"time"

	"github.com/google/uuid"
)

// Bare defines common fields that will be used by models from join tables
type Bare struct {
	ID uuid.UUID `db:"id"`
}

func (b *Bare) HasID() bool {
	return b.GetID() != uuid.Nil
}

func (b *Bare) GetID() uuid.UUID {
	return b.ID
}

func (b *Bare) GetCreated() time.Time {
	return time.Time{}
}

func (b *Bare) GetUpdated() time.Time {
	return time.Time{}
}

func (b *Bare) RefreshUpdated() {
}

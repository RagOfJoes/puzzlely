// Package models defines all DB models
package models

import (
	"time"

	"github.com/google/uuid"
)

// Base defines common fields that will be used by most models
type Base struct {
	ID        uuid.UUID  `db:"id"`
	CreatedAt time.Time  `db:"updated_at"`
	UpdatedAt *time.Time `db:"updated_at"`
}

func (b *Base) HasID() bool {
	return b.ID != uuid.Nil
}

func (b *Base) GetID() uuid.UUID {
	return b.ID
}

func (b *Base) GetCreated() time.Time {
	return b.CreatedAt
}

func (b *Base) GetUpdated() time.Time {
	if b.UpdatedAt == nil {
		return time.Time{}
	}

	return *b.UpdatedAt
}

func (b *Base) RefreshUpdated() {
	now := time.Now()
	b.UpdatedAt = &now
}

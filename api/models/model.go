package models

import (
	"time"

	"github.com/google/uuid"
)

// Model defines the interface with common methods that most db models should have
type Model interface {
	HasID() bool
	GetID() uuid.UUID
	GetCreated() time.Time
	GetUpdated() time.Time
	RefreshUpdated()
}

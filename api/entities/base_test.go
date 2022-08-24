package entities_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestBaseValidate(t *testing.T) {
	now := time.Now()
	later := time.Now().Add(1 * time.Minute)

	entity := entities.Base{
		ID:        uuid.New(),
		CreatedAt: now,
	}

	err := entity.Validate()
	assert.NoError(t, err)

	entity.UpdatedAt = &now
	err = entity.Validate()
	assert.Error(t, err)

	entity.UpdatedAt = &later
	err = entity.Validate()
	assert.NoError(t, err)
}

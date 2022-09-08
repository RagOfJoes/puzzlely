package models_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestBaseHasID(t *testing.T) {
	tests := []struct {
		model    models.Base
		expected bool
	}{
		{
			model:    models.Base{},
			expected: false,
		},
		{
			model:    models.Base{ID: uuid.Nil},
			expected: false,
		},
		{
			model:    models.Base{ID: uuid.New()},
			expected: true,
		},
	}

	for _, test := range tests {
		hasID := test.model.HasID()
		assert.Equal(t, test.expected, hasID)
	}
}

func TestBaseGetID(t *testing.T) {
	id := uuid.New()
	tests := []struct {
		model    models.Base
		expected uuid.UUID
	}{
		{
			model:    models.Base{},
			expected: uuid.Nil,
		},
		{
			model:    models.Base{ID: uuid.Nil},
			expected: uuid.Nil,
		},
		{
			model:    models.Base{ID: id},
			expected: id,
		},
	}

	for _, test := range tests {
		hasID := test.model.GetID()
		assert.Equal(t, test.expected, hasID)
	}
}

func TestBaseGetCreated(t *testing.T) {
	model := models.Base{}
	created := model.GetCreated()
	assert.Zero(t, created)

	now := time.Now()
	model.CreatedAt = now
	created = model.GetCreated()
	assert.Equal(t, now, created)
}

func TestBaseGetUpdated(t *testing.T) {
	model := models.Base{}
	updated := model.GetUpdated()
	assert.Zero(t, updated)

	model.UpdatedAt = nil
	updated = model.GetUpdated()
	assert.Zero(t, updated)

	now := time.Now()
	model.UpdatedAt = &now
	updated = model.GetUpdated()
	assert.Equal(t, now, updated)
}

func TestBaseRefreshUpdated(t *testing.T) {
	model := models.Base{}
	model.RefreshUpdated()

	assert.NotZero(t, model.UpdatedAt)
}

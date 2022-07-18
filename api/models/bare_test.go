package models_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestBareHasID(t *testing.T) {
	tests := []struct {
		model    models.Bare
		expected bool
	}{
		{
			model:    models.Bare{},
			expected: false,
		},
		{
			model:    models.Bare{ID: uuid.Nil},
			expected: false,
		},
		{
			model:    models.Bare{ID: uuid.New()},
			expected: true,
		},
	}

	for i, test := range tests {
		hasID := test.model.HasID()
		assert.Equal(t, test.expected, hasID, "(%d) Expected %v, got %v", i, test.expected, hasID)
	}
}

func TestBareGetID(t *testing.T) {
	id := uuid.New()
	tests := []struct {
		model    models.Bare
		expected uuid.UUID
	}{
		{
			model:    models.Bare{},
			expected: uuid.Nil,
		},
		{
			model:    models.Bare{ID: uuid.Nil},
			expected: uuid.Nil,
		},
		{
			model:    models.Bare{ID: id},
			expected: id,
		},
	}

	for i, test := range tests {
		hasID := test.model.GetID()
		assert.Equal(t, test.expected, hasID, "(%d) Expected %v, got %v", i, test.expected, hasID)
	}
}

func TestBareGetCreated(t *testing.T) {
	model := models.Bare{}
	created := model.GetCreated()

	assert.Zero(t, created, "Expected zero time, got %v", created)
}

func TestBareGetUpdated(t *testing.T) {
	model := models.Bare{}
	updated := model.GetUpdated()

	assert.Zero(t, updated, "Expected zero time, got %v", updated)
}

func TestBareRefreshUpdated(t *testing.T) {
	zero := models.Bare{}
	model := models.Bare{}
	model.RefreshUpdated()

	assert.Equal(t, zero, model, "Expected no change, got %v", model)
}

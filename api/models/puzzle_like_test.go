package models_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPuzzleLikeHasID(t *testing.T) {
	tests := []struct {
		model    models.PuzzleLike
		expected bool
	}{
		{
			model:    models.PuzzleLike{},
			expected: false,
		},
		{
			model:    models.PuzzleLike{ID: uuid.Nil},
			expected: false,
		},
		{
			model:    models.PuzzleLike{ID: uuid.New()},
			expected: true,
		},
	}

	for _, test := range tests {
		hasID := test.model.HasID()
		assert.Equal(t, test.expected, hasID)
	}
}

func TestPuzzleLikeGetID(t *testing.T) {
	id := uuid.New()
	tests := []struct {
		model    models.PuzzleLike
		expected uuid.UUID
	}{
		{
			model:    models.PuzzleLike{},
			expected: uuid.Nil,
		},
		{
			model:    models.PuzzleLike{ID: uuid.Nil},
			expected: uuid.Nil,
		},
		{
			model:    models.PuzzleLike{ID: id},
			expected: id,
		},
	}

	for _, test := range tests {
		hasID := test.model.GetID()
		assert.Equal(t, test.expected, hasID)
	}
}

func TestPuzzleLikeGetCreated(t *testing.T) {
	model := models.PuzzleLike{}
	created := model.GetCreated()
	assert.Zero(t, created)

	now := time.Now()
	model.CreatedAt = now
	created = model.GetCreated()
	assert.Equal(t, now, created)
}

func TestPuzzleLikeGetUpdated(t *testing.T) {
	model := models.PuzzleLike{}
	updated := model.GetUpdated()
	assert.Zero(t, updated)

	now := time.Now()
	model.UpdatedAt = now
	updated = model.GetUpdated()
	assert.Equal(t, now, updated)
}

func TestPuzzleLikeRefreshUpdated(t *testing.T) {
	model := models.PuzzleLike{}
	model.RefreshUpdated()

	assert.NotZero(t, model.UpdatedAt)
}

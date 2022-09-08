package entities_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestLikeToggle(t *testing.T) {
	id := uuid.New()
	active := false
	createdAt := time.Now()
	updatedAt := createdAt.Add(1 * time.Minute)

	like := entities.PuzzleLike{
		ID:        id,
		Active:    active,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}

	like.Toggle()
	assert.Equal(t, id, like.ID)
	assert.Equal(t, true, like.Active)
	assert.Equal(t, createdAt, like.CreatedAt)
	assert.NotEqual(t, updatedAt, like.UpdatedAt)
}

func TestLikeValidate(t *testing.T) {
	id := uuid.New()
	active := true
	createdAt := time.Now()
	updatedAt := createdAt.Add(1 * time.Minute)

	tests := []struct {
		like    entities.PuzzleLike
		isValid bool
	}{
		{
			like:    entities.PuzzleLike{},
			isValid: false,
		},
		{
			like: entities.PuzzleLike{
				ID:        id,
				Active:    active,
				CreatedAt: createdAt,
				UpdatedAt: createdAt,
			},
			isValid: false,
		},
		{
			like: entities.PuzzleLike{
				ID:        id,
				Active:    active,
				CreatedAt: createdAt,
				UpdatedAt: updatedAt,
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.like.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

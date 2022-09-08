package dtos_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPuzzleLike(t *testing.T) {
	assert.NotNil(t, dtos.PuzzleLike())
}

func TestPuzzleLikeToEntity(t *testing.T) {
	model := models.PuzzleLike{
		ID:        uuid.New(),
		Active:    true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now().Add(1 * time.Minute),
	}

	entity := dtos.PuzzleLike().ToEntity(model)

	assert.Equal(t, model.ID, entity.ID)
	assert.Equal(t, model.Active, entity.Active)
	assert.Equal(t, model.CreatedAt, entity.CreatedAt)
	assert.Equal(t, model.UpdatedAt, entity.UpdatedAt)
}

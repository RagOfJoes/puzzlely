package dtos_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPuzzleBlock(t *testing.T) {
	assert.NotNil(t, dtos.PuzzleBlock())
}

func TestPuzzleBlockToEntity(t *testing.T) {
	model := models.PuzzleBlock{
		Bare: models.Bare{
			ID: uuid.New(),
		},

		Value:   "Puzzle",
		GroupID: uuid.New(),
	}

	entity := dtos.PuzzleBlock().ToEntity(model)

	assert.Equal(t, model.ID, entity.ID)
	assert.Equal(t, model.Value, entity.Value)
	assert.Equal(t, model.GroupID, entity.GroupID)
}

func TestPuzzleBlockToModel(t *testing.T) {
	entity := entities.PuzzleBlock{
		ID:      uuid.New(),
		Value:   "Puzzle",
		GroupID: uuid.New(),
	}

	model := dtos.PuzzleBlock().ToModel(entity)

	assert.Equal(t, entity.ID, model.ID)
	assert.Equal(t, entity.Value, model.Value)
	assert.Equal(t, entity.GroupID, model.GroupID)
}

package dtos_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPuzzleGroup(t *testing.T) {
	assert.NotNil(t, dtos.PuzzleGroup())
}

func TestPuzzleGroupToEntity(t *testing.T) {
	model := models.PuzzleGroup{
		Bare: models.Bare{
			ID: uuid.New(),
		},

		Description: "Group test",
	}

	entity := dtos.PuzzleGroup().ToEntity(model)

	assert.Equal(t, model.ID, entity.ID)
	assert.Equal(t, model.Description, entity.Description)
}

func TestPuzzleGroupToModel(t *testing.T) {
	entity := entities.PuzzleGroup{
		ID:          uuid.New(),
		Description: "Group test",
	}

	model := dtos.PuzzleGroup().ToModel(entity)

	assert.Equal(t, entity.ID, model.ID)
	assert.Equal(t, entity.Description, model.Description)
}

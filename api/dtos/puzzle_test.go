package dtos_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestPuzzle(t *testing.T) {
	assert.NotNil(t, dtos.Puzzle())
}

func TestPuzzleToEntity(t *testing.T) {
	model := testutils.GeneratePuzzleModels(t, 1)[0]

	entity := dtos.Puzzle().ToEntity(model)

	assert.Equal(t, model.ID, entity.ID)
	assert.Equal(t, model.CreatedAt, entity.CreatedAt)
	assert.Equal(t, model.UpdatedAt, entity.UpdatedAt)
	assert.Equal(t, model.Name, entity.Name)
	assert.Equal(t, model.Description, entity.Description)
	assert.Equal(t, model.Difficulty, string(entity.Difficulty))
	assert.Equal(t, model.MaxAttempts, entity.MaxAttempts)
	assert.Equal(t, model.TimeAllowed, entity.TimeAllowed)
	assert.Equal(t, model.UserID, entity.CreatedBy.ID)
}

func TestPuzzleToModel(t *testing.T) {
	entity := testutils.GeneratePuzzles(t, 1)[0]

	model := dtos.Puzzle().ToModel(entity)

	assert.Equal(t, entity.ID, model.ID)
	assert.Equal(t, entity.CreatedAt, model.CreatedAt)
	assert.Equal(t, entity.UpdatedAt, model.UpdatedAt)
	assert.Equal(t, entity.Name, model.Name)
	assert.Equal(t, entity.Description, model.Description)
	assert.Equal(t, string(entity.Difficulty), model.Difficulty)
	assert.Equal(t, entity.MaxAttempts, model.MaxAttempts)
	assert.Equal(t, entity.TimeAllowed, model.TimeAllowed)
	assert.Equal(t, entity.CreatedBy.ID, model.UserID)
}

func TestPuzzleToNode(t *testing.T) {
	node := dtos.Puzzle().ToNode(entities.Base{})
	assert.Zero(t, node)

	entity := testutils.GeneratePuzzles(t, 1)[0]

	node = dtos.Puzzle().ToNode(entity)

	assert.Equal(t, entity.ID, node.ID)
	assert.Equal(t, entity.CreatedAt, node.CreatedAt)
	assert.Equal(t, entity.UpdatedAt, node.UpdatedAt)
	assert.Equal(t, entity.Name, node.Name)
	assert.Equal(t, entity.Description, node.Description)
	assert.Equal(t, entity.Difficulty, node.Difficulty)
	assert.Equal(t, entity.MaxAttempts, node.MaxAttempts)
	assert.Equal(t, entity.TimeAllowed, node.TimeAllowed)
	assert.Equal(t, entity.LikedAt, node.LikedAt)
	assert.Equal(t, entity.NumOfLikes, node.NumOfLikes)
	assert.Equal(t, entity.CreatedBy, node.CreatedBy)

	model := testutils.GeneratePuzzleModels(t, 1)[0]

	node = dtos.Puzzle().ToNode(model)

	assert.Equal(t, model.ID, node.ID)
	assert.Equal(t, model.CreatedAt, node.CreatedAt)
	assert.Equal(t, model.UpdatedAt, node.UpdatedAt)
	assert.Equal(t, model.Name, node.Name)
	assert.Equal(t, model.Description, node.Description)
	assert.Equal(t, model.Difficulty, string(node.Difficulty))
	assert.Equal(t, model.MaxAttempts, node.MaxAttempts)
	assert.Equal(t, model.TimeAllowed, node.TimeAllowed)
}

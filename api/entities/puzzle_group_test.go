package entities_test

import (
	"strconv"
	"testing"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewGroup(t *testing.T) {
	description := "Test"
	answers := []string{"foo", "bar"}
	blocks := []entities.PuzzleBlock{
		entities.NewBlock("one", uuid.Nil),
	}

	group := entities.NewGroup(description, answers, blocks)

	updatedBlocks := make([]entities.PuzzleBlock, len(blocks)-1)
	for _, block := range blocks {
		updateBlock := block
		updateBlock.GroupID = group.ID

		updatedBlocks = append(updatedBlocks, updateBlock)
	}

	assert.NotZero(t, group.ID)
	assert.Equal(t, description, group.Description)
	assert.Equal(t, answers, group.Answers)
	assert.Equal(t, updatedBlocks, group.Blocks)
}

func TestGroupValidate(t *testing.T) {
	id := uuid.New()
	description := "Test"
	answers := []string{"foo", "bar"}
	blocks := []entities.PuzzleBlock{}
	for i := 0; i < 4; i++ {
		blocks = append(blocks, entities.NewBlock(strconv.Itoa(i), id))
	}

	tests := []struct {
		group   entities.PuzzleGroup
		isValid bool
	}{
		{
			group:   entities.PuzzleGroup{},
			isValid: false,
		},
		{
			group: entities.PuzzleGroup{
				ID:          id,
				Description: "",
				Answers:     []string{"foo", "bar"},
				Blocks:      blocks,
			},
			isValid: false,
		},
		{
			group: entities.PuzzleGroup{
				ID:          id,
				Description: description,
				Answers:     []string{},
				Blocks:      blocks,
			},
			isValid: false,
		},
		{
			group: entities.PuzzleGroup{
				ID:          id,
				Description: description,
				Answers:     answers,
				Blocks:      []entities.PuzzleBlock{},
			},
			isValid: false,
		},
		{
			group: entities.PuzzleGroup{
				ID:          id,
				Description: description,
				Answers:     answers,
				Blocks:      blocks,
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.group.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

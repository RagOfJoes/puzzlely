package entities_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewBlock(t *testing.T) {
	value := "000"
	groupID := uuid.New()

	block := entities.NewBlock(value, groupID)

	assert.NotZero(t, block.ID)
	assert.Equal(t, value, block.Value)
	assert.Equal(t, groupID, block.GroupID)
}

func TestBlockValidate(t *testing.T) {
	tests := []struct {
		block   entities.PuzzleBlock
		isValid bool
	}{
		{
			block:   entities.PuzzleBlock{},
			isValid: false,
		},
		{
			block: entities.PuzzleBlock{
				ID:      uuid.New(),
				Value:   "",
				GroupID: uuid.New(),
			},
			isValid: false,
		},
		{
			block: entities.PuzzleBlock{
				ID:      uuid.New(),
				Value:   "000",
				GroupID: uuid.Nil,
			},
			isValid: false,
		},
		{
			block: entities.PuzzleBlock{
				ID:      uuid.New(),
				Value:   "000",
				GroupID: uuid.New(),
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.block.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

package entities_test

import (
	"fmt"
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewPuzzle(t *testing.T) {
	name := "Test"
	description := "Foo"
	difficulty := entities.Medium
	var maxAttempts uint16 = 10
	var timeAllowed uint32 = 3600
	createdBy := testutils.GenerateUsers(t, 1)[0]

	blocks := make([]entities.PuzzleBlock, 0, 16)
	for i := 0; i < 16; i++ {
		block := entities.NewBlock(fmt.Sprintf("Block %d", i), uuid.Nil)
		blocks = append(blocks, block)
	}
	size := 4
	groups := make([]entities.PuzzleGroup, 0, size)
	for i := 0; i < size; i++ {
		description := fmt.Sprintf("Description %d", i)
		answers := []string{fmt.Sprintf("Answers%d", i)}

		batch := make([]entities.PuzzleBlock, 0, size)
		batch = append(batch, blocks[0:size:size]...)
		blocks = blocks[size:]

		group := entities.NewGroup(description, answers, batch)
		groups = append(groups, group)
	}

	puzzle := entities.NewPuzzle(name, description, difficulty, maxAttempts, timeAllowed, groups, createdBy)

	assert.NotZero(t, puzzle.ID)
	assert.NotZero(t, puzzle.CreatedAt)
	assert.Equal(t, name, puzzle.Name)
	assert.Equal(t, description, puzzle.Description)
	assert.Equal(t, difficulty, puzzle.Difficulty)
	assert.Equal(t, maxAttempts, puzzle.MaxAttempts)
	assert.Equal(t, timeAllowed, puzzle.TimeAllowed)
	assert.Equal(t, groups, puzzle.Groups)
	assert.Equal(t, createdBy, puzzle.CreatedBy)
}

func TestPuzzleValidate(t *testing.T) {
	base := entities.Base{ID: uuid.New(), CreatedAt: time.Now()}
	name := "Test"
	description := "Foo"
	difficulty := entities.Medium
	var maxAttempts uint16 = 10
	var timeAllowed uint32 = 3600
	createdBy := testutils.GenerateUsers(t, 1)[0]

	blocks := make([]entities.PuzzleBlock, 0, 16)
	for i := 0; i < 16; i++ {
		block := entities.NewBlock(fmt.Sprintf("Block %d", i), uuid.Nil)
		blocks = append(blocks, block)
	}
	size := 4
	groups := make([]entities.PuzzleGroup, 0, size)
	for i := 0; i < size; i++ {
		description := fmt.Sprintf("Description %d", i)
		answers := []string{fmt.Sprintf("Answers%d", i)}

		batch := make([]entities.PuzzleBlock, 0, size)
		batch = append(batch, blocks[0:size:size]...)
		blocks = blocks[size:]

		group := entities.NewGroup(description, answers, batch)
		groups = append(groups, group)
	}

	tests := []struct {
		puzzle  entities.Puzzle
		isValid bool
	}{
		{
			puzzle:  entities.Puzzle{},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        "Test~",
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				Groups:      groups,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        name,
				Description: "ｶﾀｶﾅ",
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				Groups:      groups,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  "Invalid",
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				Groups:      groups,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: 1000,
				TimeAllowed: timeAllowed,
				Groups:      groups,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: 999999999,
				Groups:      groups,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				Groups:      []entities.PuzzleGroup{},
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				Groups:      groups,
			},
			isValid: false,
		},
		{
			puzzle: entities.Puzzle{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				Groups:      groups,
				CreatedBy:   createdBy,
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.puzzle.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

package entities_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPuzzleNodeValidate(t *testing.T) {
	base := entities.Base{
		ID:        uuid.New(),
		CreatedAt: time.Now(),
	}
	name := "Test"
	description := "Foo"
	difficulty := entities.Medium
	var maxAttempts uint16 = 10
	var timeAllowed uint32 = 3600
	createdBy := testutils.GenerateUsers(t, 1)[0]

	tests := []struct {
		node    entities.PuzzleNode
		isValid bool
	}{
		{
			node:    entities.PuzzleNode{},
			isValid: false,
		},
		{
			node: entities.PuzzleNode{
				Base: base,

				Name:        "Test~",
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			node: entities.PuzzleNode{
				Base: base,

				Name:        name,
				Description: "ｶﾀｶﾅ",
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			node: entities.PuzzleNode{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  "Invalid",
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			node: entities.PuzzleNode{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: 1000,
				TimeAllowed: timeAllowed,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			node: entities.PuzzleNode{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: 999999999,
				CreatedBy:   createdBy,
			},
			isValid: false,
		},
		{
			node: entities.PuzzleNode{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
			},
			isValid: false,
		},
		{
			node: entities.PuzzleNode{
				Base: base,

				Name:        name,
				Description: description,
				Difficulty:  difficulty,
				MaxAttempts: maxAttempts,
				TimeAllowed: timeAllowed,
				CreatedBy:   createdBy,
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.node.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

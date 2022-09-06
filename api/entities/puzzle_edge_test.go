package entities_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestPuzzleEdgeValidate(t *testing.T) {
	node := entities.PuzzleNode{
		Base: entities.Base{
			ID:        uuid.New(),
			CreatedAt: time.Now(),
		},

		Name:        "Test",
		Description: "Foo",
		Difficulty:  entities.Medium,
		MaxAttempts: 10,
		TimeAllowed: 3600,
		CreatedBy:   testutils.GenerateUsers(t, 1)[0],
	}

	cursor, err := entities.NewCursor("createdAt", node)
	assert.NoError(t, err)

	tests := []struct {
		edge    entities.PuzzleEdge
		isValid bool
	}{
		{
			edge:    entities.PuzzleEdge{},
			isValid: false,
		},
		{
			edge: entities.PuzzleEdge{
				Cursor: "",
				Node:   node,
			},
			isValid: false,
		},
		{
			edge: entities.PuzzleEdge{
				Cursor: "123",
				Node:   node,
			},
			isValid: false,
		},
		{
			edge: entities.PuzzleEdge{
				Cursor: cursor,
				Node:   entities.PuzzleNode{},
			},
			isValid: false,
		},
		{
			edge: entities.PuzzleEdge{
				Cursor: cursor,
				Node:   node,
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.edge.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

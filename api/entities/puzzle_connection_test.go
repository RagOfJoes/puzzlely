package entities_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestBuildPuzzleConnection(t *testing.T) {
	tests := []struct {
		limit   int
		sortKey string
		nodes   []entities.PuzzleNode
		isValid bool
	}{
		{
			limit:   1,
			sortKey: "invalid",
			nodes:   testutils.GeneratePuzzleNodes(t, 1),
			isValid: false,
		},
		{
			limit:   10,
			sortKey: "createdAt",
			nodes:   testutils.GeneratePuzzleNodes(t, 0),
			isValid: true,
		},
		{
			limit:   10,
			sortKey: "createdAt",
			nodes:   testutils.GeneratePuzzleNodes(t, 11),
			isValid: true,
		},
	}

	for _, test := range tests {
		connection, err := entities.BuildPuzzleConnection(test.limit, test.sortKey, test.nodes)

		if !test.isValid {
			assert.Nil(t, connection)
			assert.Error(t, err)
		} else {
			assert.NotNil(t, connection)
			assert.NoError(t, err)

			if len(test.nodes) > test.limit {
				assert.Equal(t, len(connection.Edges), test.limit)

				cursor, err := entities.NewCursor(test.sortKey, test.nodes[len(test.nodes)-1])
				assert.NoError(t, err)

				assert.Equal(t, cursor, connection.PageInfo.Cursor)
				assert.True(t, connection.PageInfo.HasNextPage)
			} else {
				assert.LessOrEqual(t, len(connection.Edges), test.limit)

				assert.Empty(t, connection.PageInfo.Cursor)
				assert.False(t, connection.PageInfo.HasNextPage)
			}
		}
	}
}

func TestPuzzleConnectionValidate(t *testing.T) {
	node := testutils.GeneratePuzzleNodes(t, 1)[0]

	cursor, err := entities.NewCursor("createdAt", node)
	assert.NoError(t, err)

	edge := entities.PuzzleEdge{
		Cursor: cursor,
		Node:   node,
	}

	tests := []struct {
		connection entities.PuzzleConnection
		isValid    bool
	}{
		{
			connection: entities.PuzzleConnection{},
			isValid:    false,
		},
		{
			connection: entities.PuzzleConnection{
				Edges: []entities.PuzzleEdge{
					edge,
				},
				PageInfo: entities.PageInfo{
					Cursor:      "",
					HasNextPage: false,
				},
			},
			isValid: true,
		},
		{
			connection: entities.PuzzleConnection{
				Edges: []entities.PuzzleEdge{
					edge,
				},
				PageInfo: entities.PageInfo{
					Cursor:      cursor,
					HasNextPage: true,
				},
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.connection.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

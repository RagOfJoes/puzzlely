package entities_test

import (
	"reflect"
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/stretchr/testify/assert"
)

func TestPaginationValidate(t *testing.T) {
	limit := 20
	sortKey := "createdAt"
	sortOrder := "DESC"

	now := time.Now()
	game := entities.Game{
		CreatedAt: now,
	}
	puzzle := entities.Puzzle{
		Base: entities.Base{
			CreatedAt: now,
		},
	}

	gameCursor, err := entities.NewCursor("createdAt", game)
	assert.NotEmpty(t, gameCursor)
	assert.NoError(t, err)

	puzzleCursor, err := entities.NewCursor("createdAt", puzzle)
	assert.NotEmpty(t, gameCursor)
	assert.NoError(t, err)

	tests := []struct {
		pagination entities.Pagination
		input      reflect.Type
		isValid    bool
	}{
		{
			pagination: entities.Pagination{},
			input:      entities.PuzzleReflectType,
			isValid:    false,
		},
		{
			pagination: entities.Pagination{
				Cursor:    "000",
				Limit:     limit,
				SortKey:   sortKey,
				SortOrder: sortOrder,
			},
			input:   entities.PuzzleReflectType,
			isValid: false,
		},
		{
			pagination: entities.Pagination{
				Cursor:    puzzleCursor,
				Limit:     1000,
				SortKey:   sortKey,
				SortOrder: sortOrder,
			},
			input:   entities.PuzzleReflectType,
			isValid: false,
		},
		{
			pagination: entities.Pagination{
				Cursor:    puzzleCursor,
				Limit:     limit,
				SortKey:   "testedAt",
				SortOrder: sortOrder,
			},
			input:   entities.PuzzleReflectType,
			isValid: false,
		},
		{
			pagination: entities.Pagination{
				Cursor:    puzzleCursor,
				Limit:     limit,
				SortKey:   sortKey,
				SortOrder: "ORDER",
			},
			input:   entities.PuzzleReflectType,
			isValid: false,
		},
		{
			pagination: entities.Pagination{
				Cursor:    "",
				Limit:     limit,
				SortKey:   sortKey,
				SortOrder: sortOrder,
			},
			input:   entities.GameReflectType,
			isValid: true,
		},
		{
			pagination: entities.Pagination{
				Cursor:    gameCursor,
				Limit:     limit,
				SortKey:   sortKey,
				SortOrder: sortOrder,
			},
			input:   entities.GameReflectType,
			isValid: true,
		},
		{
			pagination: entities.Pagination{
				Cursor:    "",
				Limit:     limit,
				SortKey:   sortKey,
				SortOrder: sortOrder,
			},
			input:   entities.PuzzleReflectType,
			isValid: true,
		},
		{
			pagination: entities.Pagination{
				Cursor:    puzzleCursor,
				Limit:     limit,
				SortKey:   sortKey,
				SortOrder: sortOrder,
			},
			input:   entities.PuzzleReflectType,
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.pagination.Validate(test.input)
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

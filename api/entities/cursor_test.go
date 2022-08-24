package entities_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCursorFromString(t *testing.T) {
	tests := []struct {
		input   string
		isValid bool
	}{
		{
			input:   "2022-03-01",
			isValid: false,
		},
		{
			input:   "",
			isValid: true,
		},
		{
			input:   "Q3Vyc29yOjIwMjItMDgtMDggMDc6Mjg6NDQuMDAwMDAw",
			isValid: true,
		},
	}

	for _, test := range tests {
		cursor, err := entities.CursorFromString(test.input)

		if !test.isValid {
			assert.Empty(t, cursor)
			assert.Error(t, err)
		} else {
			assert.NoError(t, err)
		}
	}
}

func TestNewCursor(t *testing.T) {
	node := entities.Base{
		ID:        uuid.New(),
		CreatedAt: time.Now(),
	}

	tests := []struct {
		input   string
		isValid bool
	}{
		{
			input:   "",
			isValid: false,
		},
		{
			input:   "created_at",
			isValid: false,
		},
		{
			input:   "id",
			isValid: true,
		},
		{
			input:   "createdAt",
			isValid: true,
		},
	}

	for _, test := range tests {
		cursor, err := entities.NewCursor(test.input, node)

		if !test.isValid {
			assert.Empty(t, cursor)
			assert.Error(t, err)
		} else {
			assert.NotEmpty(t, test.isValid, cursor)
			switch test.input {
			case "id":
				decoded, err := cursor.Decode()
				assert.Equal(t, node.ID.String(), decoded)
				assert.NoError(t, err)
			case "createdAt":
				decoded, err := cursor.Decode()
				assert.Equal(t, node.CreatedAt.Format("2006-01-02 15:04:05.000000"), decoded)
				assert.NoError(t, err)
			}

			assert.NoError(t, err)
		}
	}
}

func TestCursorDecode(t *testing.T) {
	now := time.Now()
	expected := now.Format("2006-01-02 15:04:05.000000")
	node := entities.Base{
		CreatedAt: now,
	}

	cursor, err := entities.NewCursor("createdAt", node)
	assert.NotEmpty(t, cursor, "Expected a non-empty string, got %s", cursor)
	assert.NoError(t, err, "Expected nil, got error %v", err)

	decode, err := cursor.Decode()
	assert.Equal(t, expected, decode, "Expected %v, got %v", expected, decode)
	assert.NoError(t, err, "Expected nil, got error %v", err)
}

func TestCursorEmpty(t *testing.T) {
	node := entities.Base{
		CreatedAt: time.Now(),
	}

	cursor, err := entities.NewCursor("createdAt", node)
	assert.NotEmpty(t, cursor, "Expected a non-empty string, got %s", cursor)
	assert.NoError(t, err, "Expected nil, got error %v", err)

	assert.Equal(t, false, cursor.Empty(), "Expected false, but got %v", cursor.Empty())
}

func TestCursorValidate(t *testing.T) {
	node := entities.Base{
		ID: uuid.New(),
	}

	cursor := entities.Cursor("somefakeid")
	err := cursor.Validate()
	assert.Error(t, err, "Expected error, got nil")

	cursor, err = entities.NewCursor("id", node)
	assert.NotEmpty(t, cursor, "Expected a non-empty string, got %s", cursor)
	assert.NoError(t, err, "Expected nil, got error %v", err)

	err = cursor.Validate()
	assert.NoError(t, err, "Expected nil, got error %v", err)
}

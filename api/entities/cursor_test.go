package entities_test

import (
	"encoding/base64"
	"fmt"
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewCursor(t *testing.T) {
	node := entities.Base{
		ID:        uuid.New(),
		CreatedAt: time.Now(),
	}

	tests := []struct {
		input    string
		expected entities.Cursor
	}{
		{
			input:    "",
			expected: entities.Cursor(""),
		},
		{
			input:    "created_at",
			expected: entities.Cursor(""),
		},
		{
			input:    "id",
			expected: entities.Cursor(base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s%s", "Cursor:", node.ID.String())))),
		},
		{
			input:    "createdAt",
			expected: entities.Cursor(base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s%s", "Cursor:", node.CreatedAt.Format("2006-01-02 15:04:05.000000"))))),
		},
	}

	for i, test := range tests {
		cursor, err := entities.NewCursor(test.input, node)

		if test.expected == entities.Cursor("") {
			assert.Zero(t, cursor, "(%d) Expected empty cursor, got %v", i, cursor)
			assert.Error(t, err, "(%d) Expected error, got nil", i)
		} else {
			assert.Equal(t, test.expected, cursor, "(%d) Expected %v, got %v", i, test.expected, cursor)
			assert.NoError(t, err, "(%d) Expected nil, got error %v", i, err)
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

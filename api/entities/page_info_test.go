package entities_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/stretchr/testify/assert"
)

func TestPageInfoValidate(t *testing.T) {
	now := time.Now()
	node := entities.Base{
		CreatedAt: now,
	}

	cursor, err := entities.NewCursor("createdAt", node)
	assert.NoError(t, err, "Expected nil, got error %v", err)

	tests := []struct {
		pageInfo entities.PageInfo
		isValid  bool
	}{
		{
			pageInfo: entities.PageInfo{
				Cursor:      "123",
				HasNextPage: true,
			},
			isValid: false,
		},
		{
			pageInfo: entities.PageInfo{
				Cursor:      "",
				HasNextPage: false,
			},
			isValid: true,
		},
		{
			pageInfo: entities.PageInfo{
				Cursor:      cursor,
				HasNextPage: false,
			},
			isValid: true,
		},
	}

	for i, test := range tests {
		err := test.pageInfo.Validate()
		if test.isValid {
			assert.NoError(t, err, "(%d) Expected nil, got error %v", i, err)
		} else {
			assert.Error(t, err, "(%d) Expected error, got nil", i)
		}
	}
}

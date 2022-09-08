package entities_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/stretchr/testify/assert"
)

func TestPuzzleFiltersValidate(t *testing.T) {
	customizableAttempts := false
	customizableTime := true
	difficulty := entities.Medium
	var numOfLikes uint16 = 5

	var invalidDifficulty entities.PuzzleDifficulty = "Invalid"
	var invalidNumOfLikes uint16 = 1000
	tests := []struct {
		filter  entities.PuzzleFilters
		isValid bool
	}{
		{
			filter: entities.PuzzleFilters{
				Difficulty: &invalidDifficulty,
			},
			isValid: false,
		},
		{
			filter: entities.PuzzleFilters{
				NumOfLikes: &invalidNumOfLikes,
			},
			isValid: false,
		},
		{
			filter:  entities.PuzzleFilters{},
			isValid: true,
		},
		{
			filter: entities.PuzzleFilters{
				CustomizableAttempts: &customizableAttempts,
				CustomizableTime:     &customizableTime,
				Difficulty:           &difficulty,
				NumOfLikes:           &numOfLikes,
			},
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.filter.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

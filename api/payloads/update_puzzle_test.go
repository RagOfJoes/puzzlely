package payloads_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/RagOfJoes/puzzlely/payloads"
	"github.com/stretchr/testify/assert"
)

func TestUpdatePuzzleToEntity(t *testing.T) {
	from := testutils.GeneratePuzzles(t, 1)[0]

	payload := testutils.GenerateUpdatePuzzlePayloads(t, 1)[0]
	for i, group := range from.Groups {
		payload.Groups[i].ID = group.ID
	}

	entity := payload.ToEntity(from)

	assert.Equal(t, from.ID, entity.ID)
	assert.Equal(t, from.CreatedAt, entity.CreatedAt)
	assert.Equal(t, from.UpdatedAt, entity.UpdatedAt)
	assert.Equal(t, from.MaxAttempts, entity.MaxAttempts)
	assert.Equal(t, from.TimeAllowed, entity.TimeAllowed)
	assert.Equal(t, from.CreatedBy, entity.CreatedBy)

	assert.Equal(t, payload.Name, entity.Name)
	assert.Equal(t, payload.Description, entity.Description)
	assert.Equal(t, payload.Difficulty, entity.Difficulty)

	for i, group := range entity.Groups {
		assert.Equal(t, from.Groups[i].ID, group.ID)
		assert.ElementsMatch(t, from.Groups[i].Answers, group.Answers)
		assert.ElementsMatch(t, from.Groups[i].Blocks, group.Blocks)

		assert.Equal(t, payload.Groups[i].Description, group.Description)
	}
}

func TestUpdatePuzzleValidate(t *testing.T) {
	valid := testutils.GenerateUpdatePuzzlePayloads(t, 1)[0]

	tests := []struct {
		payload payloads.UpdatePuzzle
		isValid bool
	}{
		{
			payload: payloads.UpdatePuzzle{
				Name:        "Fuck",
				Description: valid.Description,
				Difficulty:  valid.Difficulty,

				Groups: valid.Groups,
			},
			isValid: false,
		},
		{
			payload: payloads.UpdatePuzzle{
				Name:        valid.Name,
				Description: "˙¬",
				Difficulty:  valid.Difficulty,

				Groups: valid.Groups,
			},
			isValid: false,
		},
		{
			payload: payloads.UpdatePuzzle{
				Name:        valid.Name,
				Description: valid.Description,
				Difficulty:  "Invalid",

				Groups: valid.Groups,
			},
			isValid: false,
		},
		// TODO: I'm too lazy right now... Add proper group and block tests
		{
			payload: payloads.UpdatePuzzle{},
			isValid: true,
		},
		{
			payload: valid,
			isValid: true,
		},
	}

	for _, test := range tests {
		err := test.payload.Validate()
		if test.isValid {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

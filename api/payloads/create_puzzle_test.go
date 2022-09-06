package payloads_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/internal/sanitize"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/RagOfJoes/puzzlely/payloads"
	"github.com/stretchr/testify/assert"
)

func TestCreatePuzzleToEntity(t *testing.T) {
	payload := testutils.GenerateCreatePuzzlePayloads(t, 1)[0]

	entity := payload.ToEntity()

	assert.NotNil(t, entity.ID)
	assert.NotZero(t, entity.CreatedAt)

	assert.Equal(t, payload.Name, entity.Name)
	assert.NoError(t, sanitize.IsClean(entity.Description, false))
	assert.Equal(t, payload.Difficulty, entity.Difficulty)
	assert.Equal(t, payload.MaxAttempts, entity.MaxAttempts)
	assert.Equal(t, payload.TimeAllowed, entity.TimeAllowed)

	for i, group := range entity.Groups {
		assert.NotNil(t, group.ID)

		assert.ElementsMatch(t, payload.Groups[i].Answers, group.Answers)
		assert.NoError(t, sanitize.IsClean(group.Description, false))

		for j, block := range group.Blocks {
			assert.NotNil(t, block.ID)

			assert.Equal(t, block.Value, payload.Groups[i].Blocks[j].Value)
			assert.Equal(t, block.GroupID, group.ID)
		}
	}
}

func TestCreatePuzzleValidate(t *testing.T) {
	valid := testutils.GenerateCreatePuzzlePayloads(t, 1)[0]

	tests := []struct {
		payload payloads.CreatePuzzle
		isValid bool
	}{
		{
			payload: payloads.CreatePuzzle{},
			isValid: false,
		},
		{
			payload: payloads.CreatePuzzle{
				Name:        "Fuck",
				Description: valid.Description,
				Difficulty:  valid.Difficulty,
				MaxAttempts: valid.MaxAttempts,
				TimeAllowed: valid.TimeAllowed,

				Groups: valid.Groups,
			},
			isValid: false,
		},
		{
			payload: payloads.CreatePuzzle{
				Name:        valid.Name,
				Description: "˙¬",
				Difficulty:  valid.Difficulty,
				MaxAttempts: valid.MaxAttempts,
				TimeAllowed: valid.TimeAllowed,

				Groups: valid.Groups,
			},
			isValid: false,
		},
		{
			payload: payloads.CreatePuzzle{
				Name:        valid.Name,
				Description: valid.Description,
				Difficulty:  "Invalid",
				MaxAttempts: valid.MaxAttempts,
				TimeAllowed: valid.TimeAllowed,

				Groups: valid.Groups,
			},
			isValid: false,
		},
		{
			payload: payloads.CreatePuzzle{
				Name:        valid.Name,
				Description: valid.Description,
				Difficulty:  valid.Difficulty,
				MaxAttempts: 1000,
				TimeAllowed: valid.TimeAllowed,

				Groups: valid.Groups,
			},
			isValid: false,
		},
		{
			payload: payloads.CreatePuzzle{
				Name:        valid.Name,
				Description: valid.Description,
				Difficulty:  valid.Difficulty,
				MaxAttempts: valid.MaxAttempts,
				TimeAllowed: 99999999,

				Groups: valid.Groups,
			},
			isValid: false,
		},
		{
			payload: payloads.CreatePuzzle{
				Name:        valid.Name,
				Description: valid.Description,
				Difficulty:  valid.Difficulty,
				MaxAttempts: valid.MaxAttempts,
				TimeAllowed: valid.TimeAllowed,

				Groups: []payloads.CreatePuzzleGroup{},
			},
			isValid: false,
		},
		// TODO: I'm too lazy right now... Add proper group and block tests
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

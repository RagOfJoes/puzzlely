package payloads_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/payloads"
	"github.com/stretchr/testify/assert"
)

func TestUpdateUserValidate(t *testing.T) {
	tests := []struct {
		payload payloads.UpdateUser
		isValid bool
	}{
		{
			payload: payloads.UpdateUser{},
			isValid: false,
		},
		{
			payload: payloads.UpdateUser{Username: "admin"},
			isValid: false,
		},
		{
			payload: payloads.UpdateUser{Username: "Taro"},
			isValid: true,
		},
	}

	for i, test := range tests {
		err := test.payload.Validate()
		if test.isValid {
			assert.NoError(t, err, "(%d) Expected nil, got %v", i, err)
		} else {
			assert.Error(t, err, "(%d) Expected error, got nil", i)
		}
	}
}

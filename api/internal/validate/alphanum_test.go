package validate

import (
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type alphanumSpaceTest struct {
	String string `validate:"alphanumspace"`
}

func TestAlphanumSpace(t *testing.T) {
	v := validator.New()
	err := v.RegisterValidation("alphanumspace", AlphanumSpace)

	require.NoError(t, err, "Failed to register alphanum validation")

	// Errors
	invalid := alphanumSpaceTest{
		String: "$",
	}
	fieldsWithError := []string{
		"String",
	}

	errors := v.Struct(invalid).(validator.ValidationErrors)
	var fields []string
	for _, err := range errors {
		fields = append(fields, err.Field())
	}

	assert.Equal(t, fieldsWithError, fields)

	// No errors
	valid := alphanumSpaceTest{
		String: "foo bar",
	}

	assert.Equal(t, nil, v.Struct(valid))
}

package validate

import (
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type notBlankTest struct {
	String    string      `validate:"notblank"`
	Array     []int       `validate:"notblank"`
	Pointer   *int        `validate:"notblank"`
	Number    int         `validate:"notblank"`
	Interface interface{} `validate:"notblank"`
	Func      func()      `validate:"notblank"`
}

func TestNotBlank(t *testing.T) {
	tag := "notblank"

	v := validator.New()
	err := v.RegisterValidation(tag, NotBlank)
	require.NoError(t, err, "Failed to register %s validation", tag)

	// Errors
	var x *int
	invalid := notBlankTest{
		String:    " ",
		Array:     []int{},
		Pointer:   x,
		Number:    0,
		Interface: nil,
		Func:      nil,
	}
	fieldsWithError := []string{
		"String",
		"Array",
		"Pointer",
		"Number",
		"Interface",
		"Func",
	}

	errors := v.Struct(invalid).(validator.ValidationErrors)
	var fields []string
	for _, err := range errors {
		fields = append(fields, err.Field())
	}

	assert.Equal(t, fieldsWithError, fields)

	// No errors
	y := 1
	x = &y
	valid := notBlankTest{
		String:    "str",
		Array:     []int{1},
		Pointer:   x,
		Number:    1,
		Interface: "value",
		Func:      func() {},
	}

	assert.NoError(t, v.Struct(valid))
}

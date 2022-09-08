package validate

import (
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAlphanumSpace(t *testing.T) {
	tag := "alphanumspace"

	v := validator.New()
	err := v.RegisterValidation(tag, AlphanumSpace)
	require.NoError(t, err, "Failed to register %s validation", tag)

	s := "abcd123"
	errs := validate.Var(s, tag)
	assert.Equal(t, errs, nil)

	s = "abc!23"
	errs = validate.Var(s, tag)
	assert.NotEqual(t, errs, nil)
	assert.Equal(t, getError(errs, "", "").Tag(), tag)

	s = "abc 23"
	errs = validate.Var(s, tag)
	assert.Equal(t, errs, nil)

	errs = validate.Var(1, tag)
	assert.NotEqual(t, errs, nil)
	assert.Equal(t, getError(errs, "", "").Tag(), tag)
}

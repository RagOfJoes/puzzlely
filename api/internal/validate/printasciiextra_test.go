package validate

import (
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPrintASCIIExtra(t *testing.T) {
	tag := "printasciiextra"

	tests := []struct {
		param   string
		isValid bool
	}{
		{"", true},
		{"ｆｏｏbar", false},
		{"ｘｙｚ０９８", false},
		{"１２３456", false},
		{"ｶﾀｶﾅ", false},
		{"foobar", true},
		{"0987654321", true},
		{"test@example.com", true},
		{"1234abcDEF", true},
		{"carriagereturn\r", true},
		{"newline\n", true},
		{"\x19test\x7F", false},
	}

	v := validator.New()
	err := v.RegisterValidation(tag, PrintASCIIExtra)
	require.NoError(t, err, "Failed to register %s validation", tag)

	for _, test := range tests {
		errs := validate.Var(test.param, tag)

		if !assert.Equal(t, errs == nil, test.isValid) {
			if errs != nil {
				val := getError(errs, "", "")
				assert.Equal(t, tag, val.Tag())
			}
		}
	}
}

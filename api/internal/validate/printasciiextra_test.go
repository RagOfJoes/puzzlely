package validate

import (
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPrintASCIIExtra(t *testing.T) {
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
	err := v.RegisterValidation("printasciiextra", PrintASCIIExtra)
	require.NoError(t, err, "Failed to register printasciiextra validation")

	for i, test := range tests {
		errs := validate.Var(test.param, "printasciiextra")

		if !assert.Equal(t, errs == nil, test.isValid, "Index: %d Printable ASCII Extra failed Error: %s", i, errs) {
			if errs != nil {
				val := getError(errs, "", "")
				if val.Tag() != "printasciiextra" {
					t.Fatalf("Index: %d Printable ASCII failed Error: %s", i, errs)
				}
			}
		}
	}
}

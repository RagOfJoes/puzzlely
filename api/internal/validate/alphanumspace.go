package validate

import (
	"reflect"
	"regexp"

	"github.com/go-playground/validator/v10"
)

func AlphanumSpace(fl validator.FieldLevel) bool {
	reg := regexp.MustCompile(`^[\w\-\s]+$`)

	field := fl.Field()
	if field.Kind() != reflect.String {
		return false
	}

	str := field.String()
	if len(str) == 0 {
		return true
	}

	return reg.MatchString(str)
}

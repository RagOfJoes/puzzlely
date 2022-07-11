package validate

import (
	"reflect"
	"strings"
	"sync"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
)

var validate *validator.Validate
var once sync.Once

func init() {
	logrus.Info("Initialized Validator")

	once.Do(func() {
		New()
	})
}

// New initializes singleton object
func New() *validator.Validate {
	if validate != nil {
		return validate
	}

	validate = validator.New()
	validate.RegisterTagNameFunc(func(field reflect.StructField) string {
		name := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
	validate.RegisterValidation("notblank", NotBlank)
	validate.RegisterValidation("alphanumspace", AlphanumSpace)
	validate.RegisterValidation("printasciiextra", PrintASCIIExtra)

	return validate
}

// Check validates a structs exposed fields, and automatically validates nested structs, unless otherwise specified.
//
// It returns InvalidValidationError for bad values passed in and nil or ValidationErrors as error otherwise. You will need to assert the error if it's not nil eg. err.(validator.ValidationErrors) to access the array of errors.
func Check(o interface{}) error {
	e := validate.Struct(o)
	if e != nil {
		for _, ev := range e.(validator.ValidationErrors) {
			field := strings.Join(strings.Split(ev.Namespace(), ".")[1:], ".")
			return NewFormatError(ev.Kind(), field, ev.Tag(), ev.Param())
		}
	}
	return nil
}

// Var validates a single variable using tag style validation. eg. var i int validate.Var(i, "gt=1,lt=10")
//
// WARNING: a struct can be passed for validation eg. time.Time is a struct or if you have a custom type and have registered a custom type handler, so must allow it; however unforeseen validations will occur if trying to validate a struct that is meant to be passed to 'validate.Struct'
//
// It returns InvalidValidationError for bad values passed in and nil or ValidationErrors as error otherwise. You will need to assert the error if it's not nil eg. err.(validator.ValidationErrors) to access the array of errors. validate Array, Slice and maps fields which may contain more than one error
func Var(o interface{}, tag string) error {
	err := validate.Var(o, tag)
	if err != nil {
		for _, ev := range err.(validator.ValidationErrors) {
			field := strings.Join(strings.Split(ev.Namespace(), ".")[1:], ".")
			return NewFormatError(ev.Kind(), field, ev.Tag(), ev.Param())
		}
		// In case a validation error wasn't found then return an internal error
		return internal.NewErrorf(internal.ErrorCodeInternal, "%v", err)
	}

	return nil
}

func getError(err error, nsKey, structNsKey string) validator.FieldError {
	errs := err.(validator.ValidationErrors)

	var fe validator.FieldError
	for i := 0; i < len(errs); i++ {
		if errs[i].Namespace() == nsKey && errs[i].StructNamespace() == structNsKey {
			fe = errs[i]
			break
		}
	}

	return fe
}

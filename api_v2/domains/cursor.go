package domains

import (
	"encoding/base64"
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/uptrace/bun"
)

// const cursorPrefix = "Cursor:"
const (
	cursorPrefix = "Cursor:"
	timeFormat   = "2006-01-02 15:04:05.000000"
)

// Errors
var (
	ErrCursorInvalid     = errors.New("Invalid cursor.")
	ErrCursorInvalidType = errors.New("Field must be able to be converted to a valid string.")
)

// Reflect types
var (
	bunNullTimeReflectType = reflect.TypeOf(bun.NullTime{})
	intReflectType         = reflect.TypeOf(int(0))
	stringReflectType      = reflect.TypeOf("")
	timeReflectType        = reflect.TypeOf(time.Time{})
	uIntReflectType        = reflect.TypeOf(uint(0))
)

var _ Domain = (*Cursor)(nil)

type Cursor string

// NewCursor creates a new cursor by using a node's field and encodes it with base64
func NewCursor(key string, node any) (Cursor, error) {
	cursor := ""
	value := internal.UnwrapReflectValue(reflect.ValueOf(node))

	for i := 0; i < value.NumField(); i++ {
		structField := internal.UnwrapReflectType(value.Type()).Field(i)

		field := internal.UnwrapReflectValue(reflect.Indirect(value.Field(i)))
		fieldKind := field.Kind()
		fieldName := structField.Name
		fieldType := internal.UnwrapReflectType(structField.Type)

		if fieldKind == reflect.Struct && fieldType != timeReflectType {
			res, _ := NewCursor(key, field.Interface())
			if len(res) > 0 {
				return res, nil
			}
		}

		if strings.EqualFold(fieldName, key) {
			switch fieldType {
			case bunNullTimeReflectType:
				cursor = field.Interface().(bun.NullTime).Time.Format(timeFormat)
			case intReflectType:
				cursor = strconv.FormatInt(field.Int(), 10)
			case stringReflectType:
				cursor = field.String()
			case timeReflectType:
				cursor = field.Interface().(time.Time).Format(timeFormat)
			case uIntReflectType:
				cursor = strconv.FormatUint(field.Uint(), 10)
			default:
				return "", ErrCursorInvalidType
			}

			encoded := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s%s", cursorPrefix, cursor)))

			return Cursor(encoded), nil
		}
	}

	return "", fmt.Errorf("%s is not a valid key of type %t", key, node)
}

// CursorFromString creates and validates a cursor from a string type
func CursorFromString(str string) (Cursor, error) {
	cursor := Cursor(str)
	if err := cursor.Validate(); err != nil {
		return "", err
	}

	return cursor, nil
}

// Decode attempts to decode a cursor into a string
func (c *Cursor) Decode() (string, error) {
	if c.IsEmpty() {
		return "", nil
	}

	decoded, err := base64.StdEncoding.DecodeString(string(*c))
	if err != nil {
		return "", ErrCursorInvalid
	}

	prefixed := strings.TrimPrefix(string(decoded), cursorPrefix)

	return prefixed, nil
}

// IsEmpty checks if a cursor is empty
func (c *Cursor) IsEmpty() bool {
	return c == nil || *c == ""
}

func (c *Cursor) String() string {
	if c == nil {
		return ""
	}

	return string(*c)
}

func (c Cursor) Validate() error {
	if c.IsEmpty() {
		return nil
	}

	return validation.Validate(c.String(), validation.When(!c.IsEmpty(), is.Base64))
}

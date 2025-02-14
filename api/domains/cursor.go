package domains

import (
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

const (
	cursorPrefix = "Cursor:"
)

// Errors
var (
	ErrCursorInvalid = errors.New("Invalid cursor.")
)

var _ Domain = (*Cursor)(nil)

type Cursor string

// NewCursor creates a new cursor by using a node's field and encodes it with base64
func NewCursor(value string) Cursor {
	return Cursor(base64.URLEncoding.EncodeToString([]byte(fmt.Sprintf("%s%s", cursorPrefix, value))))
}

// CursorFromString creates and validates a cursor from a string type
func CursorFromString(str string) (Cursor, error) {
	cursor := Cursor(str)
	if err := cursor.Validate(); err != nil {
		return "", ErrCursorInvalid
	}

	return cursor, nil
}

// Decode attempts to decode a cursor into a string
func (c *Cursor) Decode() (string, error) {
	if c.IsEmpty() {
		return "", nil
	}

	decoded, err := base64.URLEncoding.DecodeString(string(*c))
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

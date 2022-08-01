package pagination

import (
	"encoding/base64"
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"
)

const (
	cursorPrefix = "Cursor:"
)

var (
	TimeReflectType = reflect.TypeOf(time.Time{})
)

// EncodeCursor uses base64 to encode a node's field
func EncodeCursor(key string, obj interface{}) (string, error) {
	cursor := ""
	rv := unwrapReflectValue(reflect.ValueOf(obj))
	for i := 0; i < rv.NumField(); i++ {
		structField := unwrapReflectType(rv.Type()).Field(i)
		field := unwrapReflectValue(reflect.Indirect(rv.Field(i)))
		fieldKind := field.Kind()
		fieldName := structField.Name
		fieldType := unwrapReflectType(structField.Type)
		if fieldKind == reflect.Struct && fieldType != TimeReflectType {
			res, _ := EncodeCursor(key, field.Interface())
			if len(res) > 0 {
				return res, nil
			}
		}
		if strings.EqualFold(fieldName, key) {
			switch fieldType {
			case reflect.TypeOf(int(0)):
				cursor = strconv.FormatInt(field.Int(), 10)
			case reflect.TypeOf(uint(0)):
				cursor = strconv.FormatUint(field.Uint(), 10)
			case reflect.TypeOf(""):
				cursor = field.String()
			case TimeReflectType:
				cursor = field.Interface().(time.Time).Format("2006-01-02 15:04:05.000000")
			default:
				return "", errors.New("field must either be a type of string or time")
			}

			encoded := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s%s", cursorPrefix, cursor)))
			return encoded, nil
		}
	}
	return "", errors.New("invalid key provided")
}

// DecodeCursor converts cursor into its raw string value
func DecodeCursor(s string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		return "", errors.New("invalid cursor provided")
	}
	prefixed := strings.TrimPrefix(string(decoded), cursorPrefix)
	return prefixed, nil
}

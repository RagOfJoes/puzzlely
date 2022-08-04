package pagination

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/RagOfJoes/puzzlely/internal"
)

type Params struct {
	Cursor    string
	Limit     int
	SortKey   string
	SortOrder string
}

func (p *Params) Validate(sortKeyMap map[string]string) error {
	cursor := p.Cursor
	limit := p.Limit
	sortOrder := p.SortOrder

	// Set default value for sort key
	sortKey := p.SortKey
	if sortKey == "" {
		sortKey = "created_at"
	}

	// Validate cursor
	if cursor != "" {
		decoded, err := DecodeCursor(cursor)
		if err != nil {
			return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrInvalidCursor)
		}
		p.Cursor = decoded
	}
	// Validate sort key
	if sortKeyMap[sortKey] == "" {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, fmt.Sprintf("%v is not a valid key.", sortKey))
	}

	// Validate sort order
	if sortOrder != "ASC" && sortOrder != "DESC" {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrInvalidOrder)
	}
	if limit < 1 || limit > 100 {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrInvalidLimit)
	}

	p.Limit = limit
	p.SortKey = sortKeyMap[sortKey]
	p.SortOrder = sortOrder

	return nil
}

// TODO: Replace current Validate function with this when everything has been refactored
func (p *Params) Vally(node interface{}) error {
	cursor := p.Cursor
	limit := p.Limit
	sortOrder := p.SortOrder

	// Set default value for sort key
	sortKey := p.SortKey
	if sortKey == "" {
		sortKey = "created_at"
	}

	// Validate cursor
	if cursor != "" {
		decoded, err := DecodeCursor(cursor)
		if err != nil {
			return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrInvalidCursor)
		}
		p.Cursor = decoded
	}

	// Validate sort key
	if !isValidSortKey(sortKey, node) {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%s is not a valid key", sortKey)
	}

	// Validate sort order
	if sortOrder != "ASC" && sortOrder != "DESC" {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrInvalidOrder)
	}
	if limit < 1 || limit > 100 {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrInvalidLimit)
	}

	p.Limit = limit
	p.SortOrder = sortOrder

	return nil
}

func isValidSortKey(sortKey string, node interface{}) bool {
	reflectValue := unwrapReflectValue(reflect.ValueOf(node))
	reflectType := unwrapReflectType(reflectValue.Type())

	if reflectType.Kind() != reflect.Struct {
		return false
	}

	for i := 0; i < reflectType.NumField(); i++ {
		structField := unwrapReflectType(reflectValue.Type()).Field(i)
		field := unwrapReflectValue(reflect.Indirect(reflectValue.Field(i)))

		if field.Kind() != reflect.Struct || structField.Type == TimeReflectType {
			tag := strings.Split(structField.Tag.Get("json"), ",")[0]
			if strings.EqualFold(tag, sortKey) || strings.EqualFold(tag, internal.ToCamel(sortKey, true)) {
				return true
			}

			continue
		}

		if isValid := isValidSortKey(sortKey, field.Interface()); isValid {
			return isValid
		}
	}

	return false
}

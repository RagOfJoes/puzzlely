package entities

import (
	"errors"
	"reflect"
	"strings"

	"github.com/RagOfJoes/puzzlely/internal"
)

// Errors
var (
	ErrPaginationInvalidLimit       = errors.New("Limit must be between 1 - 100.")
	ErrPaginationInvalidOrder       = errors.New("Sort order must either be ASC or DESC.")
	ErrPaginationInvalidReflectType = errors.New("Invalid reflect type.")
	ErrPaginationInvalidSortKey     = errors.New("Invalid sort key provided.")
)

// Reflect types
var (
	GameReflectType   = reflect.TypeOf(Game{})
	PuzzleReflectType = reflect.TypeOf(Puzzle{})
)

type Pagination struct {
	Cursor    Cursor
	Limit     int
	SortKey   string
	SortOrder string
}

func (p *Pagination) Validate(reflectType reflect.Type) error {
	unwrappedType := internal.UnwrapReflectType(reflectType)

	switch unwrappedType {
	case GameReflectType:
		fallthrough
	case PuzzleReflectType:
		cursor := p.Cursor
		limit := p.Limit
		sortOrder := p.SortOrder

		// Set default value for sort key
		sortKey := p.SortKey
		if sortKey == "" {
			sortKey = "created_at"
		}

		// Validate cursor
		if err := cursor.Validate(); err != nil {
			return err
		}
		// Validate sort key
		if !isValidSortKey(sortKey, unwrappedType) {
			return ErrPaginationInvalidSortKey
		}

		// Validate sort order
		if sortOrder != "ASC" && sortOrder != "DESC" {
			return ErrPaginationInvalidOrder
		}
		if limit < 1 || limit > 100 {
			return ErrPaginationInvalidLimit
		}

		p.Limit = limit
		p.SortOrder = sortOrder

		return nil
	default:
		return ErrPaginationInvalidReflectType
	}
}

func isValidSortKey(sortKey string, reflectType reflect.Type) bool {
	if reflectType.Kind() != reflect.Struct {
		return false
	}

	for i := 0; i < reflectType.NumField(); i++ {
		structField := internal.UnwrapReflectType(reflectType).Field(i)

		if structField.Type.Kind() != reflect.Struct || structField.Type == timeReflectType {
			tag := strings.Split(structField.Tag.Get("json"), ",")[0]
			if strings.EqualFold(tag, sortKey) || strings.EqualFold(tag, internal.ToCamel(sortKey, true)) {
				return true
			}

			continue
		}

		if isValid := isValidSortKey(sortKey, structField.Type); isValid {
			return isValid
		}
	}

	return false
}

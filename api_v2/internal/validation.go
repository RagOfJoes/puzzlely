package internal

import (
	"database/sql"
	"errors"
	"regexp"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/oklog/ulid/v2"
	"github.com/uptrace/bun"
)

// Regexes
var (
	regUsername = regexp.MustCompile("^[a-zA-Z][a-zA-Z0-9._-]*[a-zA-Z0-9]$")
)

// Custom validation rules
var (
	IsUsername = validation.NewStringRuleWithError(func(value string) bool {
		return regUsername.MatchString(value)
	}, validation.NewError("validation_is_username", "must start with a letter, end with a letter or number, and can include periods, hyphens, and underscores (but not consecutively)"))
)

func IsULID(value interface{}) error {
	switch value.(type) {
	case string:
		str, ok := value.(string)
		if !ok {
			return errors.New("must be a valid ULID")
		}

		if _, err := ulid.Parse(str); err != nil {
			return err
		}

		break
	case sql.NullString:
		str, ok := value.(sql.NullString)
		if !ok {
			return errors.New("must be a valid ULID")
		}

		if _, err := ulid.Parse(str.String); err != nil {
			return err
		}

		break
	}

	return nil
}

func IsAfter(a time.Time) validation.RuleFunc {
	return func(value interface{}) error {
		switch value.(type) {
		case time.Time:
			t, _ := value.(time.Time)
			if t.Before(a) {
				return errors.New("must be after " + a.String())
			}

			return nil
		case bun.NullTime:
			t, _ := value.(bun.NullTime)
			if t.IsZero() {
				return errors.New("must not be zero")
			}
			if t.Time.Before(a) {
				return errors.New("must be after " + a.String())
			}

			return nil
		}

		return errors.New("must be a valid time.Time or bun.NullTime")
	}
}

func IsBefore(b time.Time) validation.RuleFunc {
	return func(value interface{}) error {
		switch value.(type) {
		case time.Time:
			t, _ := value.(time.Time)
			if t.After(b) {
				return errors.New("must be before " + b.String())
			}

			return nil
		case bun.NullTime:
			t, _ := value.(bun.NullTime)
			if t.IsZero() {
				return errors.New("must not be zero")
			}
			if t.Time.After(b) {
				return errors.New("must be before " + b.String())
			}

			return nil
		}

		return errors.New("must be a valid time.Time or bun.NullTime")
	}
}

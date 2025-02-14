package config

import (
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

// Session config
type Session struct {
	// Lifetime controls how long a session can be valid for
	//
	// Default: 336h (2 weeks)
	Lifetime time.Duration
}

func (s Session) Validate() error {
	return validation.ValidateStruct(&s,
		validation.Field(&s.Lifetime, validation.Required),
	)
}

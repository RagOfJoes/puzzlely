package config

import validation "github.com/go-ozzo/ozzo-validation/v4"

// Telemetry
type Telemetry struct {
	// APIKey
	APIKey string
	// ServiceName
	ServiceName string
}

func (t Telemetry) Validate() error {
	return validation.ValidateStruct(&t,
		validation.Field(&t.APIKey, validation.Required),
		validation.Field(&t.ServiceName, validation.Required),
	)
}

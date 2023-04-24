package config

// Telemetry
type Telemetry struct {
	// APIKey
	APIKey string `validate:"required"`
	// ServiceName
	ServiceName string `validate:"required"`
}

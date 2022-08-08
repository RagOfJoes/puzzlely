package entities

import "github.com/RagOfJoes/puzzlely/internal/validate"

var _ Entity = (*GameConfig)(nil)

// GameConfig defines configurations for a game
type GameConfig struct {
	// MaxAttempts defines the amount of attempts a User can take to complete the game
	MaxAttempts uint16 `json:"maxAttempts" validate:"min=0,max=999"`
	// TimeAllowed defines the amount of time a User can take to complete the game
	TimeAllowed uint32 `json:"timeAllowed" validate:"min=0,max=3599000"`
}

func (c *GameConfig) Validate() error {
	return validate.Check(c)
}

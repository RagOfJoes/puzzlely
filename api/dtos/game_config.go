package dtos

import (
	"database/sql"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

var gameConfigSingleton *gameConfig

type gameConfig struct{}

func init() {
	gameConfigSingleton = &gameConfig{}
}

// Game retrieves singleton instance
func GameConfig() *gameConfig {
	return gameConfigSingleton
}

// ToModel transforms game config entity to a game config model
func (g *gameConfig) ToModel(entity entities.GameConfig) models.GameConfig {
	return models.GameConfig{
		Bare: models.Bare{
			ID: uuid.New(),
		},

		MaxAttempts: sql.NullInt16{
			Int16: int16(entity.MaxAttempts),
			Valid: true,
		},
		TimeAllowed: sql.NullInt32{
			Int32: int32(entity.TimeAllowed),
			Valid: true,
		},
	}
}

// ToEntity transforms game config model to a game config entity
func (g *gameConfig) ToEntity(model models.GameConfig) entities.GameConfig {
	return entities.GameConfig{
		MaxAttempts: uint16(model.MaxAttempts.Int16),
		TimeAllowed: uint32(model.TimeAllowed.Int32),
	}
}

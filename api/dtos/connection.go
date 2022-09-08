package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var connectionSingleton *connection

type connection struct{}

func init() {
	connectionSingleton = &connection{}
}

// Connection retrieves singleton instance
func Connection() *connection {
	return connectionSingleton
}

// ToEntity transforms user connection model to a user connection entity
func (c *connection) ToEntity(model models.Connection) entities.Connection {
	return entities.Connection{
		ID:       model.ID,
		Provider: model.Provider,
		Sub:      model.Sub,
		UserID:   model.UserID,
	}
}

// ToModel transforms user connection entity to a user connection model
func (c *connection) ToModel(entity entities.Connection) models.Connection {
	return models.Connection{
		Bare: models.Bare{
			ID: entity.ID,
		},

		Provider: entity.Provider,
		Sub:      entity.Sub,
		UserID:   entity.UserID,
	}
}

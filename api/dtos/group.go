package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var groupSingleton *group

type group struct{}

func init() {
	groupSingleton = &group{}
}

// Group retrieves singleton instance
func Group() *group {
	return groupSingleton
}

// ToEntity transforms group model to a group entity
func (g *group) ToEntity(model models.Group) entities.Group {
	return entities.Group{
		ID:          model.ID,
		Description: model.Description,
	}
}

// ToModel transforms group entity to a group model
func (g *group) ToModel(entity entities.Group) models.Group {
	return models.Group{
		Bare: models.Bare{
			ID: entity.ID,
		},

		Description: entity.Description,
	}
}

package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var blockSingleton *block

type block struct{}

func init() {
	blockSingleton = &block{}
}

// Block retrieves singleton instance
func Block() *block {
	return blockSingleton
}

// ToEntity transforms block model to a block entity
func (b *block) ToEntity(model models.Block) entities.Block {
	return entities.Block{
		ID:      model.ID,
		Value:   model.Value,
		GroupID: model.GroupID,
	}
}

// ToModel transforms block entity to a block model
func (b *block) ToModel(entity entities.Block) models.Block {
	return models.Block{
		Bare: models.Bare{
			ID: entity.ID,
		},

		Value:   entity.Value,
		GroupID: entity.GroupID,
	}
}

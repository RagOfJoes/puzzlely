package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var puzzleBlockSingleton *puzzleBlock

type puzzleBlock struct{}

func init() {
	puzzleBlockSingleton = &puzzleBlock{}
}

// PuzzleBlock retrieves singleton instance
func PuzzleBlock() *puzzleBlock {
	return puzzleBlockSingleton
}

// ToEntity transforms block model to a block entity
func (b *puzzleBlock) ToEntity(model models.PuzzleBlock) entities.PuzzleBlock {
	return entities.PuzzleBlock{
		ID:      model.ID,
		Value:   model.Value,
		GroupID: model.GroupID,
	}
}

// ToModel transforms block entity to a block model
func (b *puzzleBlock) ToModel(entity entities.PuzzleBlock) models.PuzzleBlock {
	return models.PuzzleBlock{
		Bare: models.Bare{
			ID: entity.ID,
		},

		Value:   entity.Value,
		GroupID: entity.GroupID,
	}
}

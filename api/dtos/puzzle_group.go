package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var puzzleGroupSingleton *puzzleGroup

type puzzleGroup struct{}

func init() {
	puzzleGroupSingleton = &puzzleGroup{}
}

// PuzzleGroup retrieves singleton instance
func PuzzleGroup() *puzzleGroup {
	return puzzleGroupSingleton
}

// ToEntity transforms group model to a group entity
func (g *puzzleGroup) ToEntity(model models.PuzzleGroup) entities.PuzzleGroup {
	return entities.PuzzleGroup{
		ID:          model.ID,
		Description: model.Description,
	}
}

// ToModel transforms group entity to a group model
func (g *puzzleGroup) ToModel(entity entities.PuzzleGroup) models.PuzzleGroup {
	return models.PuzzleGroup{
		Bare: models.Bare{
			ID: entity.ID,
		},

		Description: entity.Description,
	}
}

package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var puzzleSingleton *puzzle

type puzzle struct{}

func init() {
	puzzleSingleton = &puzzle{}
}

// Puzzle retrieves singleton instance
func Puzzle() *puzzle {
	return puzzleSingleton
}

// ToEntity transforms puzzle model to a puzzle entity
func (p *puzzle) ToEntity(model models.Puzzle) entities.Puzzle {
	return entities.Puzzle{
		Base: entities.Base{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
			UpdatedAt: model.UpdatedAt,
		},

		Name:        model.Name,
		Difficulty:  entities.PuzzleDifficulty(model.Difficulty),
		Description: model.Description,
		MaxAttempts: model.MaxAttempts,
		TimeAllowed: model.TimeAllowed,
		CreatedBy: entities.User{
			Base: entities.Base{
				ID: model.UserID,
			},
		},
	}
}

// ToModel transforms puzzle entity to a puzzle model
func (p *puzzle) ToModel(entity entities.Puzzle) models.Puzzle {
	return models.Puzzle{
		Base: models.Base{
			ID:        entity.ID,
			CreatedAt: entity.CreatedAt,
			UpdatedAt: entity.UpdatedAt,
		},

		Name:        entity.Name,
		Description: entity.Description,
		Difficulty:  string(entity.Difficulty),
		MaxAttempts: entity.MaxAttempts,
		TimeAllowed: entity.TimeAllowed,
		UserID:      entity.CreatedBy.ID,
	}
}

// ToNode transforms puzzle model to a puzzle node entity
func (p *puzzle) ToNode(model models.Puzzle) entities.PuzzleNode {
	return entities.PuzzleNode{
		Base: entities.Base{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
			UpdatedAt: model.UpdatedAt,
		},

		Name:        model.Name,
		Difficulty:  entities.PuzzleDifficulty(model.Difficulty),
		Description: model.Description,
		MaxAttempts: model.MaxAttempts,
		TimeAllowed: model.TimeAllowed,
	}
}

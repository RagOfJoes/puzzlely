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
		Description: model.Description,
		Difficulty:  entities.PuzzleDifficulty(model.Difficulty),
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

// ToNode transforms puzzle model or entity to a puzzle node
func (p *puzzle) ToNode(object interface{}) entities.PuzzleNode {
	switch object.(type) {
	case entities.Puzzle:
		entity := object.(entities.Puzzle)
		return entities.PuzzleNode{
			Base: entity.Base,

			Name:        entity.Name,
			Description: entity.Description,
			Difficulty:  entity.Difficulty,
			MaxAttempts: entity.MaxAttempts,
			TimeAllowed: entity.TimeAllowed,
			LikedAt:     entity.LikedAt,
			NumOfLikes:  entity.NumOfLikes,
			CreatedBy:   entity.CreatedBy,
		}
	case models.Puzzle:
		model := object.(models.Puzzle)
		return entities.PuzzleNode{
			Base: entities.Base{
				ID:        model.ID,
				CreatedAt: model.CreatedAt,
				UpdatedAt: model.UpdatedAt,
			},

			Name:        model.Name,
			Description: model.Description,
			Difficulty:  entities.PuzzleDifficulty(model.Difficulty),
			MaxAttempts: model.MaxAttempts,
			TimeAllowed: model.TimeAllowed,
		}
	default:
		return entities.PuzzleNode{}
	}
}

package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

var gameSingleton *game

type game struct{}

func init() {
	gameSingleton = &game{}
}

// Game retrieves singleton instance
func Game() *game {
	return gameSingleton
}

// ToEntity transforms game model to a game entity
func (g *game) ToEntity(model models.Game) entities.Game {
	return entities.Game{
		ID:            model.ID,
		Score:         model.Score,
		Attempts:      [][]uuid.UUID{},
		Results:       []entities.GameResult{},
		ChallengeCode: model.ChallengeCode,
		CreatedAt:     model.CreatedAt,
		StartedAt:     model.StartedAt,
		GuessedAt:     model.GuessedAt,
		CompletedAt:   model.CompletedAt,
	}
}

// ToModel transforms game entity to a game model
func (g *game) ToModel(entity entities.Game) models.Game {
	var challengedBy *uuid.UUID
	if entity.ChallengedBy != nil {
		challengedBy = &entity.ChallengedBy.ID
	}
	var userID *uuid.UUID
	if entity.User != nil {
		userID = &entity.User.ID
	}

	return models.Game{
		Bare: models.Bare{
			ID: entity.ID,
		},

		Score:         entity.Score,
		ChallengeCode: entity.ChallengeCode,
		CreatedAt:     entity.CreatedAt,
		StartedAt:     entity.StartedAt,
		GuessedAt:     entity.GuessedAt,
		CompletedAt:   entity.CompletedAt,
		ChallengedBy:  challengedBy,
		PuzzleID:      entity.Puzzle.ID,
		UserID:        userID,
	}
}

// ToNode transforms game model or entity to a game node
func (g *game) ToNode(object any) entities.GameNode {
	switch object.(type) {
	case entities.Game:
		entity := object.(entities.Game)
		return entities.GameNode{
			ID:            entity.ID,
			Score:         entity.Score,
			Attempts:      (uint8)(len(entity.Attempts)),
			Config:        entity.Config,
			ChallengeCode: entity.ChallengeCode,
			CreatedAt:     entity.CreatedAt,
			StartedAt:     entity.StartedAt,
			GuessedAt:     entity.GuessedAt,
			CompletedAt:   entity.CompletedAt,
			Puzzle:        Puzzle().ToNode(entity.Puzzle),
			User:          entity.User,
		}
	case models.Game:
		model := object.(models.Game)
		return entities.GameNode{
			ID:            model.ID,
			Score:         model.Score,
			Attempts:      0,
			ChallengeCode: model.ChallengeCode,
			CreatedAt:     model.CreatedAt,
			StartedAt:     model.StartedAt,
			GuessedAt:     model.GuessedAt,
			CompletedAt:   model.CompletedAt,
		}
	default:
		return entities.GameNode{}
	}
}

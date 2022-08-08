package dtos

import (
	"database/sql"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

var gameResultSingleton *gameResult

type gameResult struct{}

func init() {
	gameResultSingleton = &gameResult{}
}

func GameResult() *gameResult {
	return gameResultSingleton
}

// ToModel transforms game result entity to a game result model
func (g *gameResult) ToModel(entity entities.GameResult) models.GameResult {
	return models.GameResult{
		Bare: models.Bare{
			ID: uuid.New(),
		},

		Guess: sql.NullString{
			String: entity.Guess,
			Valid:  true,
		},
		Correct: sql.NullBool{
			Bool:  entity.Correct,
			Valid: true,
		},
		PuzzleGroupID: entity.PuzzleGroupID,
	}
}

// ToEntity transforms game result model to a game result entity
func (g *gameResult) ToEntity(model models.GameResult) entities.GameResult {
	return entities.GameResult{
		Guess:         model.Guess.String,
		Correct:       model.Correct.Bool,
		PuzzleGroupID: model.PuzzleGroupID,
	}
}

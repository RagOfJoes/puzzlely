package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var statsSingleton *stats

type stats struct{}

func init() {
	statsSingleton = &stats{}
}

// Stats retrieves singleton instance
func Stats() *stats {
	return statsSingleton
}

// ToEntity transforms user stats model to a user stats entity
func (s *stats) ToEntity(model models.Stats) entities.Stats {
	return entities.Stats{
		GamesPlayed:    model.GamesPlayed,
		PuzzlesCreated: model.PuzzlesCreated,
		PuzzlesLiked:   model.PuzzlesLiked,
	}
}

// ToModel transforms user stats entity to a user stats model
func (s *stats) ToModel(entity entities.Stats) models.Stats {
	return models.Stats{
		GamesPlayed:    entity.GamesPlayed,
		PuzzlesCreated: entity.PuzzlesCreated,
		PuzzlesLiked:   entity.PuzzlesLiked,
	}
}

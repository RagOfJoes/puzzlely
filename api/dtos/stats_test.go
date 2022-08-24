package dtos_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/stretchr/testify/assert"
)

func TestStats(t *testing.T) {
	assert.NotNil(t, dtos.Stats())
}

func TestStatsToEntity(t *testing.T) {
	gamesPlayed := 1
	puzzlesCreated := 2
	puzzlesLiked := 3
	model := models.Stats{
		GamesPlayed:    gamesPlayed,
		PuzzlesCreated: puzzlesCreated,
		PuzzlesLiked:   puzzlesLiked,
	}
	expect := entities.Stats{
		GamesPlayed:    gamesPlayed,
		PuzzlesCreated: puzzlesCreated,
		PuzzlesLiked:   puzzlesLiked,
	}

	entity := dtos.Stats().ToEntity(model)
	assert.Equal(t, expect, entity)
}

func TestStatsToModel(t *testing.T) {
	gamesPlayed := 1
	puzzlesCreated := 2
	puzzlesLiked := 3
	entity := entities.Stats{
		GamesPlayed:    gamesPlayed,
		PuzzlesCreated: puzzlesCreated,
		PuzzlesLiked:   puzzlesLiked,
	}
	expect := models.Stats{
		GamesPlayed:    gamesPlayed,
		PuzzlesCreated: puzzlesCreated,
		PuzzlesLiked:   puzzlesLiked,
	}

	model := dtos.Stats().ToModel(entity)
	assert.Equal(t, expect, model)
}

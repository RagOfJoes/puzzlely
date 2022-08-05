package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var puzzleLikeSingleton *puzzleLike

type puzzleLike struct{}

func init() {
	puzzleLikeSingleton = &puzzleLike{}
}

// PuzzleLike retrieves singleton instance
func PuzzleLike() *puzzleLike {
	return puzzleLikeSingleton
}

// ToEntity transforms like model to a like entity
func (l *puzzleLike) ToEntity(model models.PuzzleLike) entities.PuzzleLike {
	return entities.PuzzleLike{
		ID:        model.ID,
		Active:    model.Active,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}
}

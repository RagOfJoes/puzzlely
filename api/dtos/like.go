package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var likeSingleton *like

type like struct{}

func init() {
	likeSingleton = &like{}
}

// Like retrieves singleton instance
func Like() *like {
	return likeSingleton
}

// ToEntity transforms like model to a like entity
func (l *like) ToEntity(model models.Like) entities.Like {
	return entities.Like{
		ID:        model.ID,
		Active:    model.Active,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}
}

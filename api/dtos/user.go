package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
)

var userSingleton *user

type user struct{}

func init() {
	userSingleton = &user{}
}

// User retrieves singleton instance
func User() *user {
	return userSingleton
}

// ToEntity transforms user model to a user entity
func (u *user) ToEntity(model models.User) entities.User {
	return entities.User{
		Base: entities.Base{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
			UpdatedAt: model.UpdatedAt,
		},

		State:    entities.UserState(model.State),
		Username: model.Username,
	}
}

// ToModel transforms user entity to a user model
func (u *user) ToModel(entity entities.User) models.User {
	return models.User{
		Base: models.Base{
			ID:        entity.ID,
			CreatedAt: entity.CreatedAt,
			UpdatedAt: entity.UpdatedAt,
		},

		State:    string(entity.State),
		Username: entity.Username,
	}
}

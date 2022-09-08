package dtos

import (
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

var sessionSingleton *session

type session struct{}

func init() {
	sessionSingleton = &session{}
}

// Session retrieves singleton instance
func Session() *session {
	return sessionSingleton
}

// ToEntity transforms session model to a session entity
func (s *session) ToEntity(model models.Session) entities.Session {
	entity := entities.Session{
		ID:              model.ID,
		Token:           model.Token,
		State:           entities.SessionState(model.State),
		CreatedAt:       model.CreatedAt,
		ExpiresAt:       model.ExpiresAt,
		AuthenticatedAt: model.AuthenticatedAt,
	}

	if model.UserID.Valid {
		entity.User = &entities.User{
			Base: entities.Base{
				ID: model.UserID.UUID,
			},
		}
	}

	return entity
}

// ToModel transforms session entity to a session model
func (s *session) ToModel(entity entities.Session) models.Session {
	model := models.Session{
		Bare: models.Bare{
			ID: entity.ID,
		},

		State:           string(entity.State),
		Token:           entity.Token,
		CreatedAt:       entity.CreatedAt,
		ExpiresAt:       entity.ExpiresAt,
		AuthenticatedAt: entity.AuthenticatedAt,
	}

	if entity.User != nil {
		model.UserID = uuid.NullUUID{
			UUID:  entity.User.ID,
			Valid: true,
		}
	}

	return model
}

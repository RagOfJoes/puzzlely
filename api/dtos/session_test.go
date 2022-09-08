package dtos_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/rs/xid"
	"github.com/stretchr/testify/assert"
)

func TestSession(t *testing.T) {
	assert.NotNil(t, dtos.Session())
}

func TestSessionToEntity(t *testing.T) {
	id := uuid.New()
	token := xid.New().String()
	state := entities.Unauthenticated
	createdAt := time.Now()

	model := models.Session{
		Bare: models.Bare{
			ID: id,
		},

		State:     string(state),
		Token:     token,
		CreatedAt: createdAt,
	}
	expect := entities.Session{
		ID:        id,
		Token:     token,
		State:     state,
		CreatedAt: createdAt,
	}

	entity := dtos.Session().ToEntity(model)
	assert.Equal(t, expect, entity)

	state = entities.Authenticated
	expiresAt := createdAt.Add(1 * time.Minute)
	authenticatedAt := expiresAt.Add(1 * time.Minute)
	user := entities.User{
		Base: entities.Base{
			ID: uuid.New(),
		},
	}

	model.State = string(state)
	model.ExpiresAt = &expiresAt
	model.AuthenticatedAt = &authenticatedAt
	model.UserID = uuid.NullUUID{
		UUID:  user.ID,
		Valid: true,
	}
	expect.State = state
	expect.ExpiresAt = &expiresAt
	expect.AuthenticatedAt = &authenticatedAt
	expect.User = &user

	entity = dtos.Session().ToEntity(model)
	assert.Equal(t, expect, entity)
}

func TestSessionToModel(t *testing.T) {
	id := uuid.New()
	token := xid.New().String()
	state := entities.Unauthenticated
	createdAt := time.Now()

	entity := entities.Session{
		ID:        id,
		Token:     token,
		State:     state,
		CreatedAt: createdAt,
	}
	expect := models.Session{
		Bare: models.Bare{
			ID: id,
		},

		State:     string(state),
		Token:     token,
		CreatedAt: createdAt,
	}

	model := dtos.Session().ToModel(entity)
	assert.Equal(t, expect, model)

	state = entities.Authenticated
	expiresAt := createdAt.Add(1 * time.Minute)
	authenticatedAt := expiresAt.Add(1 * time.Minute)
	user := entities.User{
		Base: entities.Base{
			ID: uuid.New(),
		},
	}

	entity.State = state
	entity.ExpiresAt = &expiresAt
	entity.AuthenticatedAt = &authenticatedAt
	entity.User = &user
	expect.State = string(state)
	expect.ExpiresAt = &expiresAt
	expect.AuthenticatedAt = &authenticatedAt
	expect.UserID = uuid.NullUUID{
		UUID:  user.ID,
		Valid: true,
	}

	model = dtos.Session().ToModel(entity)
	assert.Equal(t, expect, model)
}

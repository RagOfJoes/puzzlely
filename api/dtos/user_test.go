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

func TestUser(t *testing.T) {
	assert.NotNil(t, dtos.User(), "Expected singleton, got nil")
}

func TestUserToEntity(t *testing.T) {
	id := uuid.New()
	createdAt := time.Now()
	state := entities.Pending
	username := xid.New().String()

	model := models.User{
		Base: models.Base{
			ID:        id,
			CreatedAt: createdAt,
		},

		State:    string(state),
		Username: username,
	}
	expect := entities.User{
		Base: entities.Base{
			ID:        id,
			CreatedAt: createdAt,
		},

		State:    state,
		Username: username,
	}

	entity := dtos.User().ToEntity(model)
	assert.Equal(t, expect, entity, "Expected %v, got %v", expect, entity)

	updatedAt := createdAt.Add(1 * time.Minute)
	updatedState := entities.Complete
	updatedUsername := "Test"
	model.UpdatedAt = &updatedAt
	model.State = string(updatedState)
	model.Username = updatedUsername
	expect.UpdatedAt = &updatedAt
	expect.State = updatedState
	expect.Username = updatedUsername

	entity = dtos.User().ToEntity(model)
	assert.Equal(t, expect, entity, "Expected %v, got %v", expect, entity)
}

func TestUserToModel(t *testing.T) {
	id := uuid.New()
	createdAt := time.Now()
	state := entities.Pending
	username := xid.New().String()

	entity := entities.User{
		Base: entities.Base{
			ID:        id,
			CreatedAt: createdAt,
		},

		State:    state,
		Username: username,
	}
	expect := models.User{
		Base: models.Base{
			ID:        id,
			CreatedAt: createdAt,
		},

		State:    string(state),
		Username: username,
	}

	model := dtos.User().ToModel(entity)
	assert.Equal(t, expect, model, "Expected %v, got %v", expect, model)

	updatedAt := createdAt.Add(1 * time.Minute)
	updatedState := entities.Complete
	updatedUsername := "Test"
	entity.UpdatedAt = &updatedAt
	entity.State = updatedState
	entity.Username = updatedUsername
	expect.State = string(updatedState)
	expect.UpdatedAt = &updatedAt
	expect.Username = updatedUsername

	model = dtos.User().ToModel(entity)
	assert.Equal(t, expect, model, "Expected %v, got %v", expect, model)
}

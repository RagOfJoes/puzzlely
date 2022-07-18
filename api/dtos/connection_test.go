package dtos_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestConnection(t *testing.T) {
	assert.NotNil(t, dtos.Connection(), "Expected singleton, got nil")
}

func TestConnectionToEntity(t *testing.T) {
	sub := "000"
	id := uuid.New()
	provider := "google"
	userID := uuid.New()

	model := models.Connection{
		Bare: models.Bare{
			ID: id,
		},

		Provider: provider,
		Sub:      sub,
		UserID:   userID,
	}
	expect := entities.Connection{
		ID:       id,
		Provider: provider,
		Sub:      sub,
		UserID:   userID,
	}

	entity := dtos.Connection().ToEntity(model)
	assert.Equal(t, expect, entity, "Expected %v, got %v", expect, entity)
}

func TestConnectionToModel(t *testing.T) {
	sub := "000"
	id := uuid.New()
	provider := "google"
	userID := uuid.New()

	entity := entities.Connection{
		ID:       id,
		Provider: provider,
		Sub:      sub,
		UserID:   userID,
	}
	expect := models.Connection{
		Bare: models.Bare{
			ID: id,
		},

		Provider: provider,
		Sub:      sub,
		UserID:   userID,
	}

	model := dtos.Connection().ToModel(entity)
	assert.Equal(t, expect, model, "Expected %v, got %v", expect, model)
}

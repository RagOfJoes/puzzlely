package entities_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewConnection(t *testing.T) {
	sub := "000"
	provider := "google"
	userID := uuid.New()

	connection := entities.NewConnection("google", "000", userID)

	assert.NotZero(t, connection.ID, "Expected valid ID, got %v", connection.ID)
	assert.Equal(t, provider, connection.Provider, "Expected %s, got %s", provider, connection.Provider)
	assert.Equal(t, sub, connection.Sub, "Expected %s, got %s", sub, connection.Sub)
	assert.Equal(t, userID, connection.UserID, "Expected %v, got %v", userID, connection.UserID)
}

func TestConnectionValidate(t *testing.T) {
	userID := uuid.New()
	connection := entities.Connection{
		ID:       uuid.New(),
		Provider: "fake",
		Sub:      "000",
		UserID:   userID,
	}

	err := connection.Validate()
	assert.Error(t, err, "Expected error, got nil")

	connection.Sub = ""
	connection.Provider = "google"
	err = connection.Validate()
	assert.Error(t, err, "Expected error, got nil")

	connection.Sub = "000"
	connection.UserID = uuid.Nil
	err = connection.Validate()
	assert.Error(t, err, "Expected error, got nil", err)

	connection.UserID = userID
	err = connection.Validate()
	assert.NoError(t, err, "Expected nil, got error %v", err)
}

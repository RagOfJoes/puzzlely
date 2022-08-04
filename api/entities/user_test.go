package entities_test

import (
	"context"
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/rs/xid"
	"github.com/stretchr/testify/assert"
)

func TestUserNewUser(t *testing.T) {
	user := entities.NewUser()

	assert.NotZero(t, user.ID, "Expected valid ID, got %v", user.ID)
	assert.NotZero(t, user.CreatedAt, "Expected a non-zero time, got %v", user.CreatedAt)
	assert.Nil(t, user.UpdatedAt, "Expected a zero time, got %v", user.UpdatedAt)
	assert.Equal(t, entities.Pending, user.State, "Expected %v, got %v", entities.Pending, user.State)
	assert.Len(t, user.Username, 20, "Expected a %d char length string, got %v", 20, user.Username)
}

func TestUserComplete(t *testing.T) {
	user := entities.User{
		Base: entities.Base{
			ID:        uuid.New(),
			CreatedAt: time.Now(),
		},

		State:    entities.Pending,
		Username: "Test",
	}

	user.Complete()
	assert.NotNil(t, user.UpdatedAt, "Expected a non-zero time, got nil")
	assert.Equal(t, entities.Complete, user.State, "Expected %v, got %v", entities.Complete, user.State)
}

func TestUserIsComplete(t *testing.T) {
	user := entities.User{
		Base: entities.Base{
			ID:        uuid.New(),
			CreatedAt: time.Now(),
		},

		State:    entities.Pending,
		Username: "Test",
	}

	isComplete := user.IsComplete()
	assert.Equal(t, false, isComplete, "Expected %v, got %v", false, isComplete)

	later := time.Now().Add(1 * time.Minute)
	user.UpdatedAt = &later
	user.State = entities.Complete
	isComplete = user.IsComplete()
	assert.Equal(t, true, isComplete, "Expected %v, got %v", true, isComplete)
}

func TestUserValidate(t *testing.T) {
	now := time.Now()

	user := entities.User{
		Base: entities.Base{
			ID:        uuid.New(),
			CreatedAt: now,
			UpdatedAt: &now,
		},

		State:    entities.Pending,
		Username: xid.New().String(),
	}

	err := user.Validate()
	assert.Error(t, err, "Expected error, got nil")

	user.UpdatedAt = nil
	user.State = "Invalid"
	err = user.Validate()
	assert.Error(t, err, "Expected error, got nil")

	user.State = entities.Complete

	user.Username = ""
	err = user.Validate()
	assert.Error(t, err, "Expected error, got nil")

	user.Username = "Te$t$"
	err = user.Validate()
	assert.Error(t, err, "Expected error, got nil")

	user.Username = "AVeryLongUsernameThatIsWrong"
	err = user.Validate()
	assert.Error(t, err, "Expected error, got nil")

	user.Username = "Sp ace"
	err = user.Validate()
	assert.Error(t, err, "Expected error, got nil")

	user.Username = "Test"
	err = user.Validate()
	assert.NoError(t, err, "Expected nil, got error %s", err)
}

func TestUserNewContext(t *testing.T) {
	user := entities.NewUser()

	ctx := context.Background()
	ctx = entities.UserNewContext(ctx, user)

	value := ctx.Value("_user").(*entities.User)
	assert.Equal(t, &user, value, "Expected %v, got %v", &user, value)
}

func TestUserFromContext(t *testing.T) {
	user := entities.NewUser()

	ctx := context.Background()

	retrieved := entities.UserFromContext(ctx)
	assert.Nil(t, retrieved, "Expected nil, got %v", retrieved)

	ctx = entities.UserNewContext(ctx, user)
	retrieved = entities.UserFromContext(ctx)
	assert.Equal(t, &user, retrieved, "Expected %v, got %v", &user, retrieved)
}

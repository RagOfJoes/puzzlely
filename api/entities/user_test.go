package entities_test

import (
	"context"
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	"github.com/google/uuid"
	"github.com/rs/xid"
	"github.com/stretchr/testify/assert"
)

func TestNewUser(t *testing.T) {
	user := entities.NewUser()

	assert.NotZero(t, user.ID)
	assert.NotZero(t, user.CreatedAt)
	assert.Nil(t, user.UpdatedAt)
	assert.Equal(t, entities.Pending, user.State)
	assert.Len(t, user.Username, 20)
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
	assert.NotNil(t, user.UpdatedAt)
	assert.Equal(t, entities.Complete, user.State)
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
	assert.Equal(t, false, isComplete)

	later := time.Now().Add(1 * time.Minute)
	user.UpdatedAt = &later
	user.State = entities.Complete
	isComplete = user.IsComplete()
	assert.Equal(t, true, isComplete)
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
	assert.Error(t, err)

	user.UpdatedAt = nil
	user.State = "Invalid"
	err = user.Validate()
	assert.Error(t, err)

	user.State = entities.Complete

	user.Username = ""
	err = user.Validate()
	assert.Error(t, err)

	user.Username = "Te$t$"
	err = user.Validate()
	assert.Error(t, err)

	user.Username = "AVeryLongUsernameThatIsWrong"
	err = user.Validate()
	assert.Error(t, err)

	user.Username = "Sp ace"
	err = user.Validate()
	assert.Error(t, err)

	user.Username = "Test"
	err = user.Validate()
	assert.NoError(t, err)
}

func TestUserNewContext(t *testing.T) {
	user := testutils.GenerateUsers(t, 1)[0]

	ctx := context.Background()
	ctx = entities.UserNewContext(ctx, user)

	value := ctx.Value("_user").(*entities.User)
	assert.Equal(t, &user, value)
}

func TestUserFromContext(t *testing.T) {
	user := testutils.GenerateUsers(t, 1)[0]

	ctx := context.Background()

	retrieved := entities.UserFromContext(ctx)
	assert.Nil(t, retrieved)

	ctx = entities.UserNewContext(ctx, user)
	retrieved = entities.UserFromContext(ctx)
	assert.Equal(t, &user, retrieved)
}

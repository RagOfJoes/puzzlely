package testutils

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/config"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/brianvoe/gofakeit/v6"
	"github.com/google/uuid"
	"github.com/rs/xid"
)

// GenerateUserState creates a random user state
func GenerateUserState(t *testing.T) entities.UserState {
	t.Helper()

	return entities.UserState(gofakeit.RandomString([]string{string(entities.Complete), string(entities.Pending)}))
}

// GenerateUsers creates n number of test user entities
func GenerateUsers(t *testing.T, n int) []entities.User {
	t.Helper()

	users := make([]entities.User, 0, n)

	for i := 0; i < n; i++ {
		id := uuid.New()
		createdAt := time.Now().Add(-8766 * time.Hour)
		state := GenerateUserState(t)

		var updatedAt *time.Time
		username := xid.New().String()

		if state == entities.Complete {
			u := gofakeit.DateRange(createdAt, time.Now())

			updatedAt = &u
			username = gofakeit.Username()
		}

		users = append(users, entities.User{
			Base: entities.Base{
				ID:        id,
				CreatedAt: createdAt,
				UpdatedAt: updatedAt,
			},

			State:    state,
			Username: username,
		})
	}

	return users
}

// SetupUserService creates a user service for testing
func SetupUserService(t *testing.T) (*mocks.User, services.User) {
	t.Helper()

	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	return repository, service
}

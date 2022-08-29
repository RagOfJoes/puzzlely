package testutils

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/config"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/brianvoe/gofakeit/v6"
	"github.com/google/uuid"
)

// GenerateUsers creates n number of test user entities
func GenerateUsers(t *testing.T, n int) []entities.User {
	t.Helper()

	users := make([]entities.User, 0, n)

	for i := 0; i < n; i++ {
		id := uuid.New()
		now := gofakeit.Date()
		username := gofakeit.Username()

		users = append(users, entities.User{
			Base: entities.Base{
				ID:        id,
				CreatedAt: now,
				UpdatedAt: nil,
			},

			State:    entities.Pending,
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

package testutils

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
)

// SetupUserService creates a user service for testing
func SetupUserService() (*mocks.User, services.User) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	return repository, service
}

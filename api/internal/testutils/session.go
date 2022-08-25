package testutils

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
)

// SetupSessionService creates a session service for testing
func SetupSessionService() (*mocks.Session, services.Session) {
	cfg := config.Configuration{}
	repository := &mocks.Session{}

	service := services.NewSession(cfg, repository)

	return repository, service
}

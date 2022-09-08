package testutils

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/internal/config"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
)

// SetupSessionService creates a session service for testing
func SetupSessionService(t *testing.T) (*mocks.Session, services.Session) {
	t.Helper()

	cfg := config.Configuration{}
	repository := &mocks.Session{}

	service := services.NewSession(cfg, repository)

	return repository, service
}

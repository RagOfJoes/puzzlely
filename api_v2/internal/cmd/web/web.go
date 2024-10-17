package web

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/sirupsen/logrus"
)

func Run() error {
	cfg, err := config.New()
	if err != nil {
		return err
	}

	// Setup Logger
	shutdownLogger, err := SetupLogger(cfg)
	if err != nil {
		return err
	}
	defer shutdownLogger()

	// Setup Repositories
	repositories, err := NewWebRepositories(cfg)
	if err != nil {
		return err
	}

	// Setup Services
	services, err := NewWebServices(cfg, repositories)
	if err != nil {
		return err
	}

	// Setup handlers
	handlers := SetupHandlers(cfg, services)

	logrus.Infoln("")
	logrus.Info("[Web] Running HTTP Server for Puzzlely...")

	// Run handlers
	return RunHandlers(cfg, handlers)
}

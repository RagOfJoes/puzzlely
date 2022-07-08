package usecase

import "github.com/RagOfJoes/puzzlely/internal/config"

type Service struct {
	Config     config.Configuration
	Repository Repository
}

func LoadService(cfg config.Configuration, repository Repository) *Service {
	return &Service{
		Config:     cfg,
		Repository: repository,
	}
}

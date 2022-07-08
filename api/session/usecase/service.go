package usecase

import "github.com/RagOfJoes/puzzlely/internal/config"

type Service struct {
	Config     config.Configuration
	Repository Repository
}

func LoadService(config config.Configuration, repository Repository) *Service {
	return &Service{
		Config:     config,
		Repository: repository,
	}
}

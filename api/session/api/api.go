package api

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/session/usecase"
	"github.com/gorilla/sessions"
)

type API struct {
	Config  config.Configuration
	Store   sessions.Store
	UseCase usecase.UseCase
}

func New(cfg config.Configuration, store sessions.Store, uc usecase.UseCase) *API {
	return &API{
		Config:  cfg,
		Store:   store,
		UseCase: uc,
	}
}

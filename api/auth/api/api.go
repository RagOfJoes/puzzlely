package api

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/session/api"
	"github.com/RagOfJoes/puzzlely/user/usecase"
	"github.com/go-chi/chi/v5"
)

type API struct {
	Config      config.Configuration
	UserUseCase usecase.UseCase
	SessionAPI  api.API
}

func New(cfg config.Configuration, userService usecase.UseCase, sessionAPI api.API, router *chi.Mux) {
	a := API{
		Config:      cfg,
		UserUseCase: userService,
		SessionAPI:  sessionAPI,
	}

	router.Post("/auth/{provider}", a.auth)
	router.Delete("/logout", a.logout)
}

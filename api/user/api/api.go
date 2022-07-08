package api

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/session/api"
	"github.com/RagOfJoes/puzzlely/user/usecase"
	"github.com/go-chi/chi/v5"
)

type API struct {
	Config     config.Configuration
	UseCase    usecase.UseCase
	SessionAPI api.API
}

func New(cfg config.Configuration, uc usecase.UseCase, sess api.API, router *chi.Mux) {
	a := &API{
		Config:     cfg,
		UseCase:    uc,
		SessionAPI: sess,
	}

	router.Get("/me", a.me)
	router.Route("/users", func(router chi.Router) {
		// Read
		router.Get("/{search}", a.get)
		router.Get("/stats/{id}", a.getStats)
		// Update
		router.Post("/update", a.update)
		// Delete
		router.Delete("/", a.delete)
	})
}

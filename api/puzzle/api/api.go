package api

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/puzzle/usecase"
	"github.com/RagOfJoes/puzzlely/session/api"
	userUseCase "github.com/RagOfJoes/puzzlely/user/usecase"
	"github.com/go-chi/chi/v5"
)

type API struct {
	Config      config.Configuration
	UserUseCase userUseCase.UseCase
	UseCase     usecase.UseCase
	SessionAPI  api.API
}

func New(cfg config.Configuration, uuc userUseCase.UseCase, uc usecase.UseCase, sess api.API, router *chi.Mux) {
	a := &API{
		Config:      cfg,
		UserUseCase: uuc,
		UseCase:     uc,
		SessionAPI:  sess,
	}

	router.Route("/puzzles", func(router chi.Router) {
		// Create
		router.Put("/", a.create)
		// Read
		router.Get("/{id}", a.get)
		router.Get("/created/{search}", a.getCreated)
		router.Get("/liked", a.getLiked)
		router.Get("/mostLiked", a.getMostLiked)
		router.Get("/mostPlayed", a.getMostPlayed)
		router.Get("/recent", a.getRecent)
		router.Get("/search", a.search)
		// Update
		router.Post("/like/{id}", a.toggleLike)
		router.Post("/{id}", a.update)
		// Delete
		router.Delete("/{id}", a.delete)
	})
}

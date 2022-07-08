package api

import (
	"github.com/RagOfJoes/puzzlely/game/usecase"
	"github.com/RagOfJoes/puzzlely/internal/config"
	puzzleUseCase "github.com/RagOfJoes/puzzlely/puzzle/usecase"
	"github.com/RagOfJoes/puzzlely/session/api"
	userUseCase "github.com/RagOfJoes/puzzlely/user/usecase"
	"github.com/go-chi/chi/v5"
)

type API struct {
	Config        config.Configuration
	PuzzleUseCase puzzleUseCase.UseCase
	UserUseCase   userUseCase.UseCase
	UseCase       usecase.UseCase
	SessionAPI    api.API
}

func New(cfg config.Configuration, puc puzzleUseCase.UseCase, uuc userUseCase.UseCase, uc usecase.UseCase, sessionAPI api.API, router *chi.Mux) {
	a := &API{
		Config:        cfg,
		PuzzleUseCase: puc,
		UseCase:       uc,
		UserUseCase:   uuc,
		SessionAPI:    sessionAPI,
	}

	router.Route("/games", func(router chi.Router) {
		// Create
		router.Put("/{id}", a.create)
		router.Put("/challenge/{challenge_code}", a.challenge)
		// Read
		router.Get("/{id}", a.get)
		router.Get("/played/{search}", a.getPlayed)
		// Update
		router.Post("/complete/{id}", a.complete)
		router.Post("/guess/{id}", a.guess)
	})
}

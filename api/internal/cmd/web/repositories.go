package web

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/postgres"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/sirupsen/logrus"
)

type WebRepositories struct {
	game    repositories.Game
	puzzle  repositories.Puzzle
	session repositories.Session
	user    repositories.User
}

func NewWebRepositories(cfg config.Configuration) (WebRepositories, error) {
	logrus.Info("[Web] Setting up repositories...")

	var repositories WebRepositories

	db, err := postgres.Connect(cfg)
	if err != nil {
		return repositories, err
	}

	repositories = WebRepositories{
		game:    postgres.NewGame(db),
		puzzle:  postgres.NewPuzzle(db),
		session: postgres.NewSession(db),
		user:    postgres.NewUser(db),
	}

	return repositories, nil
}

func (w *WebRepositories) Game() repositories.Game {
	return w.game
}

func (w *WebRepositories) Puzzle() repositories.Puzzle {
	return w.puzzle
}

func (w *WebRepositories) Session() repositories.Session {
	return w.session
}

func (w *WebRepositories) User() repositories.User {
	return w.user
}

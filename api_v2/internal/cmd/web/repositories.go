package web

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/mysql"
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

	db, err := mysql.Connect(cfg)
	if err != nil {
		return repositories, err
	}

	repositories = WebRepositories{
		game:    mysql.NewGame(db),
		puzzle:  mysql.NewPuzzle(db),
		session: mysql.NewSession(db),
		user:    mysql.NewUser(db),
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

package web

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/sirupsen/logrus"
)

type WebServices struct {
	game    services.Game
	oauth   services.OAuth2Config
	puzzle  services.Puzzle
	session services.Session
	user    services.User
}

func NewWebServices(cfg config.Configuration, repositories WebRepositories) (WebServices, error) {
	logrus.Infoln("")
	logrus.Info("[Web] Setting up services...")

	return WebServices{
		game: services.NewGame(services.GameDependencies{
			Repository: repositories.Game(),
		}),
		oauth: services.NewOAuth2Config(services.OAuth2ConfigDependencies{
			Config: cfg,
		}),
		puzzle: services.NewPuzzle(services.PuzzleDependencies{
			Repository: repositories.Puzzle(),
		}),
		session: services.NewSession(services.SessionDependencies{
			Repository: repositories.Session(),
		}),
		user: services.NewUser(services.UserDependencies{
			Repository: repositories.User(),
		}),
	}, nil
}

func (w WebServices) Game() services.Game {
	return w.game
}

func (w WebServices) OAuth2Config() services.OAuth2Config {
	return w.oauth
}

func (w WebServices) Puzzle() services.Puzzle {
	return w.puzzle
}

func (w WebServices) Session() services.Session {
	return w.session
}

func (w WebServices) User() services.User {
	return w.user
}

package puzzlely

import (
	"log"
	"strings"

	"github.com/RagOfJoes/puzzlely/api"
	authAPI "github.com/RagOfJoes/puzzlely/auth/api"
	gameAPI "github.com/RagOfJoes/puzzlely/game/api"
	gameMySQL "github.com/RagOfJoes/puzzlely/game/repository/mysql"
	gameUseCase "github.com/RagOfJoes/puzzlely/game/usecase"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/mysql"
	puzzleAPI "github.com/RagOfJoes/puzzlely/puzzle/api"
	puzzleMySQL "github.com/RagOfJoes/puzzlely/puzzle/repository/mysql"
	puzzleUseCase "github.com/RagOfJoes/puzzlely/puzzle/usecase"
	sessionAPI "github.com/RagOfJoes/puzzlely/session/api"
	sessionMySQL "github.com/RagOfJoes/puzzlely/session/repository/mysql"
	sessionUseCase "github.com/RagOfJoes/puzzlely/session/usecase"
	userAPI "github.com/RagOfJoes/puzzlely/user/api"
	userMySQL "github.com/RagOfJoes/puzzlely/user/repository/mysql"
	userUseCase "github.com/RagOfJoes/puzzlely/user/usecase"
	"github.com/gorilla/sessions"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

// Start starts the API Web Server
func Start() {
	logger := logrus.New()
	viper := viper.NewWithOptions(viper.KeyDelimiter("_"))

	cfgPtr, err := config.New(viper, logger)
	if err != nil {
		log.Panic(err)
	}
	cfg := *cfgPtr

	logrus.Info("Starting puzzlely...\n\n")

	// Setup Database
	mySQL, err := mysql.Connect(cfg)
	if err != nil {
		logrus.Fatal(err)
	}
	defer mySQL.Close()

	// Setup Repositories
	logrus.Info("Setting up Repositories...")
	sessionMySQL := sessionMySQL.New(mySQL)
	userMySQL := userMySQL.New(mySQL)
	puzzleMySQL := puzzleMySQL.New(mySQL)
	gameMySQL := gameMySQL.New(mySQL)
	logrus.Info("Successfully setup Repositories\n\n")

	// Setup Services
	logrus.Info("Setting up Services...")
	sessionService := sessionUseCase.LoadService(cfg, sessionMySQL)
	userService := userUseCase.LoadService(cfg, userMySQL)
	puzzleService := puzzleUseCase.LoadService(cfg, puzzleMySQL)
	gameService := gameUseCase.LoadService(cfg, gameMySQL)
	logrus.Info("Successfully setup Services\n\n")

	// Setup session manager
	secrets := [][]byte{}
	for _, secret := range cfg.Session.Cookie.Secrets {
		secrets = append(secrets, []byte(secret))
	}
	store := sessions.NewCookieStore(secrets...)
	store.Options = &sessions.Options{
		Path:     cfg.Session.Cookie.Path,
		Domain:   cfg.Session.Cookie.Domain,
		SameSite: cfg.Session.Cookie.SameSite,
		MaxAge:   int(cfg.Session.Lifetime.Seconds()),
		Secure:   cfg.Environment == config.Production,
		HttpOnly: cfg.Environment == config.Production,
	}
	sessionAPI := sessionAPI.New(cfg, store, sessionService)

	// Setup HTTP Server
	router := api.New(cfg, logger)

	// Attach handlers
	authAPI.New(
		cfg,
		userService,
		*sessionAPI,
		router,
	)
	gameAPI.New(
		cfg,
		puzzleService,
		userService,
		gameService,
		*sessionAPI,
		router,
	)
	puzzleAPI.New(
		cfg,
		userService,
		puzzleService,
		*sessionAPI,
		router,
	)
	userAPI.New(
		cfg,
		userService,
		*sessionAPI,
		router,
	)

	var routes []string
	for _, r := range router.Routes() {
		routes = append(routes, r.Pattern)
	}
	logrus.Infof("Attached %s to HTTP Server", strings.Join(routes, ", "))

	if err := api.Run(cfg, router); err != nil {
		logrus.Panicf("Failed to start HTTP Server: %s", err)
	}
}

package puzzlely

import (
	"log"
	"strings"

	"github.com/RagOfJoes/puzzlely/apis"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/mysql"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func serve() {
	logger := logrus.New()
	viper := viper.NewWithOptions(viper.KeyDelimiter("_"))

	newConfig, err := config.New(viper, logger)
	if err != nil {
		log.Panic(err)
	}

	cfg := *newConfig

	logrus.Info("Starting Puzzlely...\n\n")

	// Setup Database
	mySQL, err := mysql.Connect(cfg)
	if err != nil {
		logrus.Fatal(err)
	}
	defer mySQL.Close()

	// Setup Repositories
	logrus.Info("Setting up Repositories...")
	sessionMySQL := mysql.NewSession(mySQL)
	userMySQL := mysql.NewUser(mySQL)
	puzzleMySQL := mysql.NewPuzzle(mySQL)
	gameMySQL := mysql.NewGame(mySQL, puzzleMySQL)
	logrus.Info("Successfully setup Repositories...\n\n")

	// Setup Services
	logrus.Info("Setting up Services...")
	sessionService := services.NewSession(cfg, sessionMySQL)
	userService := services.NewUser(cfg, userMySQL)
	puzzleService := services.NewPuzzle(cfg, puzzleMySQL)
	gameService := services.NewGame(cfg, gameMySQL)
	logrus.Info("Successfully setup Services\n\n")

	// Setup Session API handlers
	sessionAPI := apis.Session(cfg, sessionService)

	// Setup HTTP Server
	router := apis.New(cfg)

	// Register endpoints
	apis.User(cfg, userService, sessionAPI, router)
	apis.Auth(cfg, sessionAPI, userService, router)
	apis.Puzzle(cfg, puzzleService, sessionAPI, userService, router)
	apis.Game(cfg, puzzleService, gameService, sessionAPI, userService, router)

	var routes []string
	for _, r := range router.Routes() {
		routes = append(routes, r.Pattern)
	}
	logrus.Infof("Attached %s to HTTP Server", strings.Join(routes, ", "))

	if err := apis.Run(cfg, router); err != nil {
		logrus.Panicf("Failed to start HTTP Server: %s", err)
	}
}

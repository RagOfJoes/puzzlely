package mysql

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"

	_ "github.com/go-sql-driver/mysql"
)

const (
	// Puzzle related tables
	PuzzlesTable            string = "puzzles"
	PuzzleBlocksTable       string = "puzzle_blocks"
	PuzzleGroupAnswersTable string = "puzzle_group_answers"
	PuzzleGroupsTable       string = "puzzle_groups"
	PuzzleLikesTable        string = "puzzle_likes"
	// User related tables
	ConnectionsTable string = "connections"
	SessionsTable    string = "sessions"
	UsersTable       string = "users"
	// Game related tables
	GamesTable   string = "games"
	GameConfigs  string = "game_configs"
	GameAttempts string = "game_attempts"
	GameCorrects string = "game_corrects"
	GameResults  string = "game_results"
)

func Connect(cfg config.Configuration) (*sqlx.DB, error) {
	fields := logrus.Fields{
		"driver": "mysql",
	}

	logrus.WithFields(fields).Info("Connecting to MySQL...")
	db, err := sqlx.Connect("mysql", cfg.Database.DSN)
	if err != nil {
		logrus.Errorf("Failed to connect to MySQL: %s", err)
		return nil, err
	}
	logrus.WithFields(fields).Info("Successfully connected to MySQL\n\n")
	return db, nil
}

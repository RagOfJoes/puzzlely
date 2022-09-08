package mysql

import (
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"

	_ "github.com/go-sql-driver/mysql"
)

const (
	// Puzzle related tables
	PuzzleTable            = "puzzles"
	PuzzleBlockTable       = "puzzle_blocks"
	PuzzleGroupAnswerTable = "puzzle_group_answers"
	PuzzleGroupTable       = "puzzle_groups"
	PuzzleLikeTable        = "puzzle_likes"
	// User related tables
	ConnectionTable = "connections"
	SessionTable    = "sessions"
	UserTable       = "users"
	// Game related tables
	GameTable        = "games"
	GameConfigTable  = "game_configs"
	GameAttemptTable = "game_attempts"
	GameCorrectTable = "game_corrects"
	GameResultTable  = "game_results"
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

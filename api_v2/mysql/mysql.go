package mysql

import (
	"database/sql"
	"fmt"
	"runtime"
	"time"

	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/mysqldialect"

	_ "github.com/go-sql-driver/mysql"
)

func Connect(cfg config.Configuration) (*bun.DB, error) {
	dialect := mysqldialect.New()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", cfg.Database.User, cfg.Database.Password, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
	sql, err := sql.Open(dialect.Name().String(), dsn)
	if err != nil {
		logrus.Errorf("Failed to connect to MySQL: %s", err)

		return nil, err
	}

	if cfg.Environment == config.Production {
		maxLifetime := time.Minute * 3
		maxOpenConns := 4 * runtime.GOMAXPROCS(0)

		sql.SetConnMaxIdleTime(maxLifetime)
		sql.SetConnMaxLifetime(maxLifetime)

		sql.SetMaxIdleConns(maxOpenConns)
		sql.SetMaxOpenConns(maxOpenConns)
	}

	db := bun.NewDB(sql, dialect, bun.WithDiscardUnknownColumns())
	if db == nil {
		logrus.Errorf("Failed to instantiate bun")

		return nil, err
	}

	logrus.WithFields(logrus.Fields{
		"driver": "mysql",
	}).Info("Successfully connected to MySQL")

	return db, nil
}

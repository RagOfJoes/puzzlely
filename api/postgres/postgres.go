package postgres

import (
	"database/sql"
	"errors"
	"fmt"
	"runtime"
	"time"

	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	"github.com/uptrace/bun/extra/bunotel"
)

const (
	ErrCodeUniqueViolation = "23505"
)

func Connect(cfg config.Configuration) (*bun.DB, error) {
	dialect := pgdialect.New()

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", cfg.Database.User, cfg.Database.Password, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
	conn := pgdriver.NewConnector(
		pgdriver.WithDSN(dsn),
		pgdriver.WithTimeout(5*time.Second),
		pgdriver.WithReadTimeout(30*time.Second),
		pgdriver.WithWriteTimeout(30*time.Second),
		pgdriver.WithApplicationName("puzzlely"),
	)

	sqldb := sql.OpenDB(conn)
	if cfg.Environment == config.Production {
		maxLifetime := time.Minute * 3
		maxOpenConns := 4 * runtime.GOMAXPROCS(0)

		sqldb.SetConnMaxIdleTime(maxLifetime)
		sqldb.SetConnMaxLifetime(maxLifetime)

		sqldb.SetMaxIdleConns(maxOpenConns)
		sqldb.SetMaxOpenConns(maxOpenConns)
	}

	// Test connection
	err := sqldb.Ping()
	if err != nil {
		return nil, err
	}

	db := bun.NewDB(sqldb, dialect)
	if db == nil {
		return nil, errors.New("Failed to instantiate bun")
	}

	db.AddQueryHook(bunotel.NewQueryHook(bunotel.WithDBName(cfg.Database.Name)))

	logrus.WithFields(logrus.Fields{
		"driver": "postgres",
	}).Info("Successfully connected to Postgres")

	return db, nil
}

// IsUniqueError checks whether the error is a postgres unique constraint error
func IsUniqueError(err error) bool {
	// Edge case
	if err == nil {
		return false
	}

	var pgError pgdriver.Error
	return errors.As(err, &pgError) && pgError.Field('C') == ErrCodeUniqueViolation
}

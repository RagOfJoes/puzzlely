package config

import (
	"time"

	"github.com/sirupsen/logrus"
)

type Logger struct {
	Level        int `validate:"min=0,max=6"`
	ReportCaller bool
}

func SetupLogger(config Configuration, logger *logrus.Logger) error {
	logrus.SetLevel(logrus.Level(config.Logger.Level))
	logrus.SetReportCaller(config.Logger.ReportCaller)
	logrus.SetFormatter(&logrus.TextFormatter{
		DisableTimestamp: false,
		DisableColors:    false,
		DisableQuote:     false,
		FullTimestamp:    true,
		TimestampFormat:  time.RFC3339,
	})

	return nil
}

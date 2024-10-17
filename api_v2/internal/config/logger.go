package config

import (
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/sirupsen/logrus"
)

type Logger struct {
	Level        int
	ReportCaller bool
}

func (l Logger) Validate() error {
	return validation.ValidateStruct(&l,
		validation.Field(&l.Level, validation.Min(0), validation.Max(6)),
		validation.Field(&l.ReportCaller),
	)
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

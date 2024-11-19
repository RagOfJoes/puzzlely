package config

import (
	"os"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

type Environment string

var (
	Development Environment = "Development"
	Production  Environment = "Production"
)

type Configuration struct {
	// Environment
	//
	// Default: Development
	Environment Environment

	// Essentials
	//

	Logger Logger

	Database  Database
	Providers Providers

	Server    Server
	Session   Session
	Telemetry Telemetry
}

func (c Configuration) Validate() error {
	return validation.ValidateStruct(&c,
		validation.Field(&c.Environment, validation.Required, validation.In(Development, Production)),

		validation.Field(&c.Logger, validation.Required),

		validation.Field(&c.Database, validation.Required),
		validation.Field(&c.Providers, validation.Required),

		validation.Field(&c.Server, validation.Required),
		validation.Field(&c.Session, validation.Required),
		validation.Field(&c.Telemetry, validation.Required),
	)
}

func SetDefaults(v *viper.Viper) {
	// Environment
	v.SetDefault("ENVIRONMENT", "Production")
	// Logger
	v.SetDefault("LOGGER_LEVEL", int(logrus.InfoLevel))
	v.SetDefault("LOGGER_REPORTCALLER", false)

	// Server
	v.SetDefault("SERVER_SECURITY_ISDEVELOPMENT", false)
	v.SetDefault("SERVER_SECURITY_REFERRERPOLICY", "same-origin")
	v.SetDefault("SERVER_SECURITY_HOSTSPROXYHEADERS", []string{"X-Forwarded-Hosts"})
}

func New() (Configuration, error) {
	v := viper.NewWithOptions(viper.KeyDelimiter("_"))
	SetDefaults(v)

	v.SetConfigName("puzzlely")
	v.AutomaticEnv()

	dir := os.Getenv("XDG_CONFIG_HOME")
	if dir == "" {
		dir = "$HOME/.config"
	}
	v.AddConfigPath(dir + "/web/")
	v.AddConfigPath("/etc/web/")
	v.AddConfigPath("./")
	if err := v.ReadInConfig(); err != nil {
		return Configuration{}, err
	}

	config := Configuration{}
	if err := v.Unmarshal(&config); err != nil {
		return Configuration{}, err
	}
	if err := config.Validate(); err != nil {
		return Configuration{}, err
	}

	SetupServer(&config)

	return config, nil
}

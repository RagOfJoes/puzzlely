package services

import (
	"errors"

	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
)

var (
	ErrOAuth2ConfigRefreshBasecampToken = errors.New("Failed to refresh Basecamp token.")
)

type OAuth2Config struct {
	discord oauth2.Config
	github  oauth2.Config
	google  oauth2.Config
}

type OAuth2ConfigDependencies struct {
	Config config.Configuration
}

func NewOAuth2Config(dependencies OAuth2ConfigDependencies) OAuth2Config {
	logrus.Print("Created OAuth2Config Service")

	discord := oauth2.Config{
		ClientID:     dependencies.Config.Providers.Discord.ClientID,
		ClientSecret: dependencies.Config.Providers.Discord.ClientSecret,
	}

	return OAuth2Config{
		discord: discord,
	}
}

func (o *OAuth2Config) Discord() *oauth2.Config {
	return &o.discord
}

func (o *OAuth2Config) GitHub() *oauth2.Config {
	return &o.github
}

func (o *OAuth2Config) Google() *oauth2.Config {
	return &o.google
}

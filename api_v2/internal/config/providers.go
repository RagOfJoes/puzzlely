package config

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

type Provider struct {
	// URL is where the access token will be used to check whether authenticated User
	URL string
	// ClientID defines the client id for Provider
	ClientID string
	// ClientSecret defines the client secret for Provider
	ClientSecret string
}

func (p Provider) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.URL, validation.Required, is.URL),
		validation.Field(&p.ClientID, validation.Required),
		validation.Field(&p.ClientSecret, validation.Required),
	)
}

type Providers struct {
	Discord Provider
	GitHub  Provider
	Google  Provider
}

func (p Providers) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Discord, validation.Required),
		validation.Field(&p.GitHub, validation.Required),
		validation.Field(&p.Google, validation.Required),
	)
}

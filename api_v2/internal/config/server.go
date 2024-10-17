package config

import (
	"fmt"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/unrolled/secure"
)

type Server struct {
	// Base configurations
	//

	// Port of the server.
	//
	// Default: 80
	Port string
	// Host of the server.
	//
	// Default: :
	Host string
	// Scheme
	//
	// Default: https
	Scheme string
	// URL is the public url which users will use to access API
	//
	// Example: google.com
	URL string

	// Route configurations
	//

	// Prefix for the endpoints.
	//
	// Example: v1
	// Default: ""
	Prefix string

	// Middleware configurations
	//

	// Security are the options that controls the security middleware.
	Security secure.Options
}

func (s Server) Validate() error {
	return validation.ValidateStruct(&s,
		validation.Field(&s.Port, validation.Required, is.Port),
		validation.Field(&s.Host, validation.Required, validation.In(is.Host, ":")),
		validation.Field(&s.Scheme, validation.Required, validation.In("http", "https")),
		validation.Field(&s.URL, validation.Required, is.URL),
	)
}

func SetupServer(config *Configuration) {
	// Setup default values for development
	server := config.Server

	// Security
	security := server.Security
	security.IsDevelopment = true

	server.URL = fmt.Sprintf("%s://%s", server.Scheme, server.URL)
	// If the environment is production, we need to harden the security headers
	if config.Environment == Production {
		// Security header defaults
		security.FrameDeny = true
		security.SSLRedirect = false
		security.IsDevelopment = false
		security.STSSeconds = 315360000
		security.BrowserXssFilter = true
		security.ContentTypeNosniff = true
		security.ReferrerPolicy = "same-origin"
	}

	// Update Server config
	server.Security = security
	config.Server = server
}

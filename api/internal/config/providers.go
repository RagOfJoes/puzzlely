package config

type Provider struct {
	// URL is where the access token will be used to check whether authenticated User
	URL string `validate:"required"`
	// ClientID defines the client id for Provider
	ClientID string `validate:"required"`
	// ClientSecret defines the client secret for Provider
	ClientSecret string `validate:"required"`
}

type Providers struct {
	Discord Provider
	Google  Provider
	GitHub  Provider
}

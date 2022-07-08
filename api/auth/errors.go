package auth

import "errors"

var (
	ErrAlreadyAuthenticated   = errors.New("Cannot access this resource while logged in.")
	ErrFailedDiscord          = errors.New("Failed to retrieve Discord profile from response.")
	ErrFailedGitHub           = errors.New("Failed to retrieve GitHub profile from response.")
	ErrFailedGoogle           = errors.New("Failed to retrieve Google profile from response.")
	ErrInvalidProviderProfile = errors.New("Profile retrieved from provider is invalid.")
	ErrInvalidAccessToken     = errors.New("Must provide access token.")
	ErrUnauthorized           = errors.New("You must be logged in to access this resource.")
)

package services

import "errors"

// Common errors
var (
	ErrUnauthorized = errors.New("You must be logged in to access this resource.")
)

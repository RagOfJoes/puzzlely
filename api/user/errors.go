package user

import "errors"

var (
	ErrDoesNotExist    = errors.New("User does not exist.")
	ErrInvalidID       = errors.New("Invalid user id.")
	ErrInvalidUsername = errors.New("Invalid username.")
	ErrFailedCreate    = errors.New("Failed to create new user.")
	ErrFailedDelete    = errors.New("Failed to delete user.")
	ErrFailedUpdate    = errors.New("Failed to update user.")
)

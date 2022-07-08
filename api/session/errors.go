package session

import "errors"

var (
	ErrFailedCreate        = errors.New("Failed to create new session.")
	ErrFailedDelete        = errors.New("Failed to delete session.")
	ErrFailedStoreGet      = errors.New("Failed to retrieve cookie from cookie store.")
	ErrFailedStoreSave     = errors.New("Failed to save cookie to cookie store.")
	ErrFailedUpdate        = errors.New("Failed to update session.")
	ErrInvalidSession      = errors.New("Invalid session provided.")
	ErrInvalidSessionID    = errors.New("Invalid session id provided.")
	ErrInvalidSessionToken = errors.New("Invalid session token provided.")
	ErrSessionNotFound     = errors.New("No active session found.")
)

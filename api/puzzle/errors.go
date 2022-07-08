package puzzle

import "errors"

var (
	ErrFailedCreate   = errors.New("Failed to create puzzle.")
	ErrFailedDelete   = errors.New("Failed to delete puzzle.")
	ErrFailedLike     = errors.New("Failed to like puzzle.")
	ErrFailedList     = errors.New("Failed to fetch puzzles.")
	ErrFailedUpdate   = errors.New("Failed to update puzzle.")
	ErrInvalid        = errors.New("Invalid puzzle.")
	ErrInvalidFilter  = errors.New("Invalid filter values.")
	ErrInvalidID      = errors.New("Invalid puzzle id.")
	ErrInvalidName    = errors.New("Invalid puzzle name.")
	ErrInvalidPayload = errors.New("Invalid puzzle payload provided.")
	ErrInvalidSearch  = errors.New("Invalid search term.")
	ErrNotAuthorized  = errors.New("Not authorized to access this puzzle's details.")
	ErrNotFound       = errors.New("Puzzle not found.")
	ErrUserNotFound   = errors.New("User not found.")
)

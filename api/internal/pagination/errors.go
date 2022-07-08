package pagination

import "errors"

// Errors
var (
	ErrInvalidCursor = errors.New("Invalid cursor.")
	ErrInvalidLimit  = errors.New("Limit must be between 1 - 100.")
	ErrInvalidOrder  = errors.New("Sort order must either be ASC or DESC.")
)

package game

import "errors"

var (
	ErrAlreadyComplete              = errors.New("Can't update a completed Game.")
	ErrAlreadyGuessed               = errors.New("Game has already been guessed.")
	ErrTooManyAttempts              = errors.New("Attempts must be less than or equal to configured max attempts.")
	ErrFailedCreate                 = errors.New("Failed to create Game.")
	ErrFailedPlayed                 = errors.New("Failed to fetch user's game history.")
	ErrFailedUpdate                 = errors.New("Failed to update Game.")
	ErrInvalid                      = errors.New("Invalid Game.")
	ErrInvalidAttempts              = errors.New("An attempt must have 4 unique and valid values.")
	ErrInvalidCompletedAt           = errors.New("Must provide valid date for CompletedAt")
	ErrInvalidCorrect               = errors.New("Correct must have unique and valid values.")
	ErrInvalidCorrectAndScore       = errors.New("Correct and Score must match.")
	ErrInvalidChallengeCode         = errors.New("Invalid challenge code.")
	ErrInvalidPuzzle                = errors.New("Invalid Puzzle.")
	ErrInvalidResults               = errors.New("Results must have unique and valid values.")
	ErrInvalidScore                 = errors.New("Invalid Score.")
	ErrInvalidTime                  = errors.New("Took longer than configured time.")
	ErrInvalidUpdatePayload         = errors.New("Invalid update payload provided.")
	ErrNotFound                     = errors.New("Game not found.")
	ErrNotStarted                   = errors.New("Game has not been started yet.")
	ErrRequireStartedAtAndGuessedAt = errors.New("Must provide valid start and guess dates.")
	ErrUserNotFound                 = errors.New("User not found.")
)

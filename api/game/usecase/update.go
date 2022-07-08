package usecase

import (
	"github.com/RagOfJoes/puzzlely/game"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/user"
)

func StripUpdate(old game.Game, update *game.Game) {
	// Strip update of anything that shouldn't be updated
	update.ChallengeCode = old.ChallengeCode
	update.CreatedAt = old.CreatedAt
	update.Puzzle = old.Puzzle
	update.User = old.User
	// Make sure Config wasn't accidentally updated if Puzzle doesn't allow it
	if old.Puzzle.MaxAttempts > 0 {
		update.Config.MaxAttempts = old.Config.MaxAttempts
	}
	if old.Puzzle.TimeAllowed > 0 {
		update.Config.TimeAllowed = old.Config.TimeAllowed
	}
	// Make sure config wasn't updated if challengedBy is set
	if old.ChallengedBy != nil {
		update.Config = old.Config
	}
}

func ValidateUpdate(old, update game.Game, currentUser *user.User) error {
	// Do some basic validation first
	if old.ID != update.ID {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalid)
	}
	// If Game is already completed error out
	if old.CompletedAt != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrAlreadyComplete)
	}
	// Validate Games
	if err := validate.Check(old); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrInvalid)
	}
	if err := validate.Check(update); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", game.ErrInvalid)
	}
	// Make sure Game belongs to User
	if !old.IsUserValid(currentUser) || !update.IsUserValid(currentUser) {
		return internal.NewErrorf(internal.ErrorCodeNotFound, "%v", game.ErrNotFound)
	}

	return nil
}

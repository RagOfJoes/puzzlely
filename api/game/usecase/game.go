package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/game"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

var (
	sortKeyMap = map[string]string{
		"createdAt":  "created_at",
		"created_at": "created_at",
	}
)

// New creates a new Game for Puzzle
func (s *Service) New(ctx context.Context, puzzle puzzle.Puzzle, currentUser *user.User) (*game.Game, error) {
	if err := validate.Check(puzzle); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidPuzzle)
	}

	newGame := game.New(puzzle, currentUser)
	if err := validate.Check(newGame); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedCreate)
	}

	created, err := s.Repository.Create(ctx, newGame)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedCreate)
	}
	if err := validate.Check(created); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedCreate)
	}

	return created, nil
}

// Challenge creates a new Game based off of an exiting Game
func (s *Service) Challenge(ctx context.Context, challengeCode string, currentUser *user.User) (*game.Game, error) {
	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	found, err := s.Repository.GetWithChallengeCode(ctx, challengeCode, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrInvalidChallengeCode)
	}
	if err := validate.Check(found); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrInvalidChallengeCode)
	}

	challengedBy := found.Node()
	if found.ChallengedBy != nil {
		challengedBy = *found.ChallengedBy
	}

	newGame := game.New(found.Puzzle, currentUser)
	newGame.Config = found.Config
	newGame.ChallengedBy = &challengedBy
	if err := validate.Check(newGame); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedCreate)
	}

	created, err := s.Repository.Create(ctx, newGame)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedCreate)
	}
	if err := validate.Check(created); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedCreate)
	}

	return created, nil
}

// Find finds a Game
func (s *Service) Find(ctx context.Context, id uuid.UUID, currentUser *user.User) (*game.Game, error) {
	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	found, err := s.Repository.Get(ctx, id, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrNotFound)
	}
	if err := validate.Check(found); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", game.ErrNotFound)
	}

	if !found.IsUserValid(currentUser) {
		return nil, internal.NewErrorf(internal.ErrorCodeNotFound, "%v", game.ErrNotFound)
	}

	return found, nil
}

// FindPlayed finds all the Games played for a given User
func (s *Service) FindPlayed(ctx context.Context, params pagination.Params, user user.User, currentUser *user.User) (*game.Connection, error) {
	if err := params.Validate(sortKeyMap); err != nil {
		return nil, err
	}
	params.Limit = params.Limit + 1

	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	list, err := s.Repository.GetPlayed(ctx, params, user, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedPlayed)
	}

	var edges []*game.Edge
	for _, node := range list {
		cursor, err := pagination.EncodeCursor(internal.ToCamel(params.SortKey, true), node)
		if err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedPlayed)
		}
		edges = append(edges, &game.Edge{
			Node:   node,
			Cursor: cursor,
		})
	}

	hasNextPage := len(edges) > params.Limit-1
	pageInfo := game.PageInfo{
		Cursor:      "",
		HasNextPage: hasNextPage,
	}
	if hasNextPage {
		pageInfo.Cursor = edges[len(edges)-1].Cursor
		edges = edges[:len(edges)-1]
	}

	// If edges was not initialized then do so here to not trigger validation error
	if edges == nil {
		edges = []*game.Edge{}
	}
	connection := game.Connection{
		Edges:    edges,
		PageInfo: pageInfo,
	}

	if err := validate.Check(connection); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedPlayed)
	}

	return &connection, nil
}

// Complete completes a Game
func (s *Service) Complete(ctx context.Context, old, update game.Game, currentUser *user.User) (*game.Game, error) {
	if err := ValidateUpdate(old, update, currentUser); err != nil {
		return nil, err
	}

	// Must have GuessedAt and StartedAt already set
	if old.GuessedAt == nil || old.StartedAt == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrNotStarted)
	}
	// Must have CompleteAt set
	if update.CompletedAt == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidCompletedAt)
	}
	// Results must be set and must have the same length as Puzzle.Groups
	if update.Results == nil || len(update.Results) != len(old.Puzzle.Groups) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidResults)
	}

	StripUpdate(old, &update)
	// Make sure only Score and CompletedAt are updated
	// Set Attempts and Correct to nil to prevent from being needlessly updated
	update.Attempts = nil
	update.Config = old.Config
	update.Correct = nil
	update.StartedAt = old.StartedAt
	update.GuessedAt = old.GuessedAt

	// Results must have unique and valid values
	groupIDs := []uuid.UUID{}
	for _, group := range old.Puzzle.Groups {
		groupIDs = append(groupIDs, group.ID)
	}
	resultIDs := []uuid.UUID{}
	for _, result := range update.Results {
		resultIDs = append(resultIDs, result.PuzzleGroupID)
	}
	if !internal.IsUniqueUUIDSlice(resultIDs) || !internal.IsUUIDEvery(groupIDs, resultIDs) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidResults)
	}

	updated, err := s.Repository.Update(ctx, update)
	// Re-set Attempts and Correct
	updated.Attempts = old.Attempts
	updated.Correct = old.Correct
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedUpdate)
	}
	if err := validate.Check(updated); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedUpdate)
	}

	return updated, nil
}

// Guess guesses a Game
func (s *Service) Guess(ctx context.Context, old, update game.Game, currentUser *user.User) (*game.Game, error) {
	if err := ValidateUpdate(old, update, currentUser); err != nil {
		return nil, err
	}

	// Make sure start and guess dates aren't already set
	if old.StartedAt != nil || old.GuessedAt != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrAlreadyGuessed)
	}
	// Make sure start and guess dates were provided with update
	if update.StartedAt == nil || update.GuessedAt == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrRequireStartedAtAndGuessedAt)
	}
	// Impossible for a Game to have a score that's greater than 4 at this stage
	if update.Score > 4 {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidScore)
	}
	// Score and Correct must be the same
	if int(update.Score) != len(update.Correct) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidCorrectAndScore)
	}

	StripUpdate(old, &update)
	// Make sure only Attempts, Config, Correct, Score, StartedAt, and, GuessedAt are updated
	update.Results = nil
	update.CompletedAt = nil

	// Make sure GuessedAt is within Config parameters
	if update.Config.TimeAllowed > 0 && update.GuessedAt.Sub(*update.StartedAt).Milliseconds() > int64(update.Config.TimeAllowed) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidTime)
	}

	// Retrieve Group and Blocks IDs
	groupIDs := []uuid.UUID{}
	blockIDs := []uuid.UUID{}
	for _, group := range old.Puzzle.Groups {
		groupIDs = append(groupIDs, group.ID)
		for _, block := range group.Blocks {
			blockIDs = append(blockIDs, block.ID)
		}
	}
	// Correct must have unique values and must have proper GroupIDs
	if !internal.IsUniqueUUIDSlice(update.Correct) || !internal.IsUUIDEvery(groupIDs, update.Correct) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidCorrect)
	}
	// Attempts must be within Config parameters
	// Attempts must contain unique values and must have proper BlocksIDs
	if update.Attempts != nil {
		if update.Config.MaxAttempts > 0 && uint16(len(update.Attempts)) > update.Config.MaxAttempts {
			return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrTooManyAttempts)
		}
		for _, attempts := range update.Attempts {
			if len(attempts) != 4 {
				return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidAttempts)
			}
			if !internal.IsUniqueUUIDSlice(attempts) || !internal.IsUUIDEvery(blockIDs, attempts) {
				return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", game.ErrInvalidAttempts)
			}
		}
	}

	updated, err := s.Repository.Update(ctx, update)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedUpdate)
	}
	if err := validate.Check(updated); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", game.ErrFailedUpdate)
	}

	return updated, nil
}

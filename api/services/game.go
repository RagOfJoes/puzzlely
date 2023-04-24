package services

import (
	"context"
	"errors"

	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// Errors
var (
	ErrGameAlreadyGuessed               = errors.New("Game has already been guessed.")
	ErrGameInvalidAttempts              = errors.New("An attempt must have 4 unique and valid values.")
	ErrGameInvalidChallengeCode         = errors.New("Invalid challenge code provided.")
	ErrGameInvalidCompletedAt           = errors.New("Invalid completed at date provided.")
	ErrGameInvalidCorrect               = errors.New("Correct guesses must have unique and valid values.")
	ErrGameInvalidCorrectAndScore       = errors.New("Number of correct guesses and score must match.")
	ErrGameInvalidResults               = errors.New("Results must have unique and valid values.")
	ErrGameInvalidScore                 = errors.New("Invalid score.")
	ErrGameInvalidStartedAtAndGuessedAt = errors.New("Must provide valid start and guess dates.")
	ErrGameInvalidTime                  = errors.New("Took longer than configured time.")
	ErrGameInvalidUpdate                = errors.New("Invalid game updates provided.")
	ErrGameNew                          = errors.New("Failed to create game.")
	ErrGameNotFound                     = errors.New("Game not found.")
	ErrGameNotStarted                   = errors.New("Game has not been started yet.")
	ErrGamePlayed                       = errors.New("Failed to fetch user's game history.")
	ErrGameTooManyAttempts              = errors.New("Attempts must be less than or equal to configured max attempts.")
	ErrGameUpdate                       = errors.New("Failed to update game.")
)

type Game struct {
	config     config.Configuration
	repository repositories.Game
}

func NewGame(config config.Configuration, repository repositories.Game) Game {
	logrus.Print("Created Game Service")

	return Game{
		config:     config,
		repository: repository,
	}
}

func (g *Game) New(ctx context.Context, puzzle entities.Puzzle) (*entities.Game, error) {
	if err := puzzle.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleInvalid)
	}

	user := entities.UserFromContext(ctx)

	newGame := entities.NewGame(puzzle, user)
	if err := newGame.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameNew)
	}

	game, err := g.repository.Create(ctx, newGame)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameNew)
	}
	if err := game.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameNew)
	}

	return game, nil
}

func (g *Game) Challenge(ctx context.Context, challengeCode string) (*entities.Game, error) {
	oldGame, err := g.repository.GetWithChallengeCode(ctx, challengeCode)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameInvalidChallengeCode)
	}
	if err := oldGame.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameInvalidChallengeCode)
	}

	user := entities.UserFromContext(ctx)

	challengedBy := dtos.Game().ToNode(*oldGame)
	if oldGame.ChallengedBy != nil {
		challengedBy = *oldGame.ChallengedBy
	}

	newGame := entities.NewGame(oldGame.Puzzle, user)
	newGame.Config = oldGame.Config
	newGame.ChallengedBy = &challengedBy
	if err := newGame.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameNew)
	}

	game, err := g.repository.Create(ctx, newGame)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameNew)
	}
	if err := game.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameNew)
	}

	return game, nil
}

func (g *Game) Find(ctx context.Context, id uuid.UUID) (*entities.Game, error) {
	game, err := g.repository.Get(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}
	if err := game.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)

	}

	user := entities.UserFromContext(ctx)

	if !game.IsUserValid(user) {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}

	return game, nil
}

func (g *Game) FindPlayed(ctx context.Context, params entities.Pagination, user entities.User) (*entities.GameConnection, error) {
	if err := params.Validate(entities.GameReflectType); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	params.Limit = params.Limit + 1

	nodes, err := g.repository.GetPlayed(ctx, params, user)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGamePlayed)
	}

	connection, err := entities.BuildGameConnection(params.Limit, params.SortKey, nodes)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGamePlayed)
	}

	return connection, nil
}

func (g *Game) Complete(ctx context.Context, oldGame, updateGame entities.Game) (*entities.Game, error) {
	user := entities.UserFromContext(ctx)

	if !updateGame.IsUpdateValid(oldGame, user) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidUpdate)
	}

	// Must have GuessedAt and StartedAt already set
	if oldGame.GuessedAt == nil || oldGame.StartedAt == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameNotStarted)
	}
	// Must have CompleteAt set
	if updateGame.CompletedAt == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidCompletedAt)
	}
	// Results must be set and must have the same length as Puzzle.Groups
	if updateGame.Results == nil || len(updateGame.Results) != len(oldGame.Puzzle.Groups) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidResults)
	}

	updateGame.CleanUpdate(oldGame)
	// Make sure only Score and CompletedAt are updated
	// Set Attempts and Correct to nil to prevent from being needlessly updated
	updateGame.Attempts = nil
	updateGame.Config = oldGame.Config
	updateGame.Correct = nil
	updateGame.StartedAt = oldGame.StartedAt
	updateGame.GuessedAt = oldGame.GuessedAt

	// Results must have unique and valid values
	groupIDs := []uuid.UUID{}
	for _, group := range oldGame.Puzzle.Groups {
		groupIDs = append(groupIDs, group.ID)
	}
	resultIDs := []uuid.UUID{}
	for _, result := range updateGame.Results {
		resultIDs = append(resultIDs, result.PuzzleGroupID)
	}
	if unique := internal.Unique(resultIDs); len(unique) != len(resultIDs) && !internal.Every(groupIDs, resultIDs) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidResults)
	}

	game, err := g.repository.Update(ctx, updateGame)
	// Re-set Attempts and Correct
	game.Attempts = oldGame.Attempts
	game.Correct = oldGame.Correct
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameUpdate)
	}
	if err := game.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameUpdate)
	}

	return game, nil
}

func (g *Game) Guess(ctx context.Context, oldGame, updateGame entities.Game) (*entities.Game, error) {
	user := entities.UserFromContext(ctx)

	if !updateGame.IsUpdateValid(oldGame, user) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidUpdate)
	}

	// Make sure start and guess dates aren't already set
	if oldGame.StartedAt != nil || oldGame.GuessedAt != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameAlreadyGuessed)
	}
	// Make sure start and guess dates were provided with update
	if updateGame.StartedAt == nil || updateGame.GuessedAt == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidStartedAtAndGuessedAt)
	}
	// Impossible for a Game to have a score that's greater than 4 at this stage
	if updateGame.Score > 4 {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidScore)
	}
	// Score and Correct must be the same
	if int(updateGame.Score) != len(updateGame.Correct) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidCorrectAndScore)
	}

	updateGame.CleanUpdate(oldGame)
	// Make sure only Attempts, Config, Correct, Score, StartedAt, and, GuessedAt are updated
	updateGame.Results = nil
	updateGame.CompletedAt = nil

	// Make sure GuessedAt is within Config parameters
	if updateGame.Config.TimeAllowed > 0 && updateGame.GuessedAt.Sub(*updateGame.StartedAt).Milliseconds() > int64(updateGame.Config.TimeAllowed) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidTime)
	}

	// Retrieve Group and Blocks IDs
	var groupIDs = make([]uuid.UUID, 0, len(oldGame.Puzzle.Groups))
	var blockIDs = make([]uuid.UUID, 0, 16)
	for _, group := range oldGame.Puzzle.Groups {
		groupIDs = append(groupIDs, group.ID)
		for _, block := range group.Blocks {
			blockIDs = append(blockIDs, block.ID)
		}
	}
	// Correct must have unique values and must have proper GroupIDs
	if unique := internal.Unique(groupIDs); len(unique) != len(updateGame.Correct) && !internal.Every(groupIDs, updateGame.Correct) {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidCorrect)
	}
	// Attempts must be within Config parameters
	// Attempts must contain unique values and must have proper BlocksIDs
	if updateGame.Attempts != nil {
		if updateGame.Config.MaxAttempts > 0 && uint16(len(updateGame.Attempts)) > updateGame.Config.MaxAttempts {
			return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameTooManyAttempts)
		}
		for _, attempts := range updateGame.Attempts {
			if len(attempts) != 4 {
				return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidAttempts)
			}
			if unique := internal.Unique(attempts); len(unique) != len(attempts) && !internal.Every(blockIDs, attempts) {
				return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrGameInvalidAttempts)
			}
		}
	}

	game, err := g.repository.Update(ctx, updateGame)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameUpdate)
	}
	if err := game.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameUpdate)
	}

	return game, nil
}

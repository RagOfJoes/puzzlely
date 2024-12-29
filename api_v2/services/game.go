package services

import (
	"context"
	"errors"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"
)

// Errors
var (
	ErrGameFailedCreate = errors.New("Failed to create a new game.")
	ErrGameHistory      = errors.New("Failed to get game history.")
	ErrGameNotFound     = errors.New("Game not found.")
)

type Game struct {
	repository repositories.Game
}

type GameDependencies struct {
	Repository repositories.Game
}

func NewGame(d GameDependencies) Game {
	logrus.Print("Created Game Service")

	return Game{
		repository: d.Repository,
	}
}

func (g *Game) FindByPuzzleID(ctx context.Context, puzzleID ulid.ULID) (*domains.Game, error) {
	game, err := g.repository.GetWithPuzzleID(ctx, puzzleID.String())
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}
	if err := game.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}

	return game, nil
}

func (g *Game) FindHistory(ctx context.Context, userID string, opts domains.GameCursorPaginationOpts) (*domains.GameSummaryConnection, error) {
	if err := opts.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameHistory)
	}

	games, err := g.repository.GetHistory(ctx, userID, opts)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameHistory)
	}

	// Validate results
	for i := range games {
		game := &games[i]
		game.Attempts = game.Attempts - int16(game.Score)

		if err := game.Validate(); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameHistory)
		}
	}

	connection, err := domains.BuildGameSummaryConnection(games, opts.Limit)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleLiked)
	}

	return connection, nil
}

func (g *Game) Save(ctx context.Context, game domains.Game) (*domains.Game, error) {
	if err := game.Validate(); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	savedGame, err := g.repository.Save(ctx, game)
	if err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	return savedGame, nil
}

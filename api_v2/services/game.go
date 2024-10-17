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

func (g *Game) Create(ctx context.Context, puzzle domains.Puzzle) (*domains.Game, error) {
	// If the user is authenticated, then, retrieve their data from the context
	session := domains.SessionFromContext(ctx)

	// Create a new game with the given puzzle and user
	newGame := domains.NewGame(puzzle, session.User)
	// Create the game and persist it in the database
	createdGame, err := g.repository.Create(ctx, newGame)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameFailedCreate)
	}
	// Validate the created game
	if err := createdGame.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameFailedCreate)
	}

	return createdGame, nil
}

func (g *Game) FindByPuzzleID(ctx context.Context, puzzleID ulid.ULID) (*domains.Game, error) {
	// If the user is authenticated, then, retrieve their data from the context
	session := domains.SessionFromContext(ctx)

	// Find the game with the given puzzle id
	foundGame, err := g.repository.GetWithPuzzleID(ctx, puzzleID.String())
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}
	// Validate the found game
	if err := foundGame.Validate(); err != nil {
		logrus.Info(err)
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}

	// TODO: If user isn't currently authenticated should probably assign them a guest user
	//
	// Check if the game belongs to the user
	if session == nil && !foundGame.UserID.Valid && foundGame.User == nil {
		return foundGame, nil
	} else if session != nil && foundGame.UserID.Valid && foundGame.User != nil && foundGame.UserID.String == session.UserID.String {
		return foundGame, nil
	}

	return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
}

func (g *Game) FindHistory(ctx context.Context, cursor domains.Cursor, user domains.User) (*domains.GameConnection, error) {
	foundGames, err := g.repository.GetHistory(ctx, cursor, user)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameHistory)
	}

	builtConnection, err := domains.BuildGameConnection("CompletedAt", foundGames)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameHistory)
	}

	return builtConnection, nil
}

func (g *Game) Update(ctx context.Context, updateGame domains.Game) error {
	panic("not implemented")
}

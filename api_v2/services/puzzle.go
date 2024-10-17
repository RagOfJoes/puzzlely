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
	ErrPuzzleNotFound = errors.New("Puzzle not found.")
	ErrPuzzleRecent   = errors.New("Failed to get recent puzzles.")
)

type Puzzle struct {
	repository repositories.Puzzle
}

type PuzzleDependencies struct {
	Repository repositories.Puzzle
}

func NewPuzzle(d PuzzleDependencies) Puzzle {
	logrus.Print("Created Puzzle Service")

	return Puzzle{
		repository: d.Repository,
	}
}

func (p *Puzzle) Find(ctx context.Context, id ulid.ULID) (*domains.Puzzle, error) {
	foundPuzzle, err := p.repository.Get(ctx, id.String())
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}
	if err := foundPuzzle.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}

	return foundPuzzle, nil
}

func (p *Puzzle) FindCreated(ctx context.Context, userID string, cursor domains.Cursor) (*domains.PuzzleSummaryConnection, error) {
	foundPuzzles, err := p.repository.GetCreated(ctx, userID, cursor)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	builtConnection, err := domains.BuildPuzzleSummaryConnection("CreatedAt", foundPuzzles)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	return builtConnection, nil
}

func (p *Puzzle) FindPopular(ctx context.Context, cursor domains.Cursor) (*domains.PuzzleConnection, error) {
	foundPuzzles, err := p.repository.GetPopular(ctx, cursor)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	builtConnection, err := domains.BuildPuzzleConnection("ID", foundPuzzles)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	return builtConnection, nil
}

func (p *Puzzle) FindRecent(ctx context.Context, cursor domains.Cursor) (*domains.PuzzleConnection, error) {
	foundPuzzles, err := p.repository.GetRecent(ctx, cursor)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	builtConnection, err := domains.BuildPuzzleConnection("CreatedAt", foundPuzzles)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	return builtConnection, nil
}

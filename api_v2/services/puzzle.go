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
	ErrPuzzleNew      = errors.New("Failed to create new puzzle.")
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

func (p *Puzzle) New(ctx context.Context, newPuzzle domains.Puzzle) (*domains.Puzzle, error) {
	if err := newPuzzle.Validate(); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	created, err := p.repository.Create(ctx, newPuzzle)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleNew)
	}
	if err := created.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleNew)
	}

	return *&created, nil
}

func (p *Puzzle) Find(ctx context.Context, id ulid.ULID) (*domains.Puzzle, error) {
	puzzle, err := p.repository.Get(ctx, id.String())
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}
	if err := puzzle.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrPuzzleNotFound)
	}

	return puzzle, nil
}

func (p *Puzzle) FindCreated(ctx context.Context, userID string, opts domains.PuzzleCursorPaginationOpts) (*domains.PuzzleSummaryConnection, error) {
	puzzles, err := p.repository.GetCreated(ctx, userID, opts)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	connection, err := domains.BuildPuzzleSummaryConnection(puzzles, opts.Limit)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	return connection, nil
}

func (p *Puzzle) FindRecent(ctx context.Context, opts domains.PuzzleCursorPaginationOpts) (*domains.PuzzleConnection, error) {
	if err := opts.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	puzzles, err := p.repository.GetRecent(ctx, opts)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	connection, err := domains.BuildPuzzleConnection(puzzles, opts.Limit)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}
	if len(connection.Edges) == 0 {
		return connection, nil
	}

	decoded, err := connection.Edges[0].Cursor.Decode()
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	hasPreviousPage, err := p.repository.HasPreviousForRecent(ctx, decoded)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}
	if hasPreviousPage {
		connection.PageInfo.HasPreviousPage = hasPreviousPage
		connection.PageInfo.PreviousCursor = connection.Edges[0].Cursor
	}

	return connection, nil
}

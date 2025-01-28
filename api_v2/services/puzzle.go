package services

import (
	"context"
	"errors"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
)

// Errors
var (
	ErrPuzzleCreated    = errors.New("Failed to get created puzzles.")
	ErrPuzzleLiked      = errors.New("Failed to get liked puzzles.")
	ErrPuzzleNew        = errors.New("Failed to create new puzzle.")
	ErrPuzzleNotFound   = errors.New("Puzzle not found.")
	ErrPuzzleRecent     = errors.New("Failed to get recent puzzles.")
	ErrPuzzleToggleLike = errors.New("Failed to toggle like on puzzle.")
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

	return created, nil
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
	if err := opts.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleCreated)
	}

	puzzles, err := p.repository.GetCreated(ctx, userID, opts)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleCreated)
	}

	// Validate results
	for _, puzzle := range puzzles {
		if err := puzzle.Validate(); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleCreated)
		}
	}

	connection, err := domains.BuildPuzzleSummaryConnection(puzzles, opts.Limit)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleCreated)
	}

	return connection, nil
}

func (p *Puzzle) FindLiked(ctx context.Context, userID string, opts domains.PuzzleCursorPaginationOpts) (*domains.PuzzleSummaryConnection, error) {
	if err := opts.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleLiked)
	}

	puzzles, err := p.repository.GetLiked(ctx, userID, opts)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleLiked)
	}

	// Validate results
	for _, puzzle := range puzzles {
		if err := puzzle.Validate(); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleLiked)
		}
	}

	connection, err := domains.BuildPuzzleSummaryConnectionForLiked(puzzles, opts.Limit)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleLiked)
	}

	return connection, nil
}

func (p *Puzzle) FindRecent(ctx context.Context, opts domains.PuzzleCursorPaginationOpts) (*domains.PuzzleConnection, error) {
	if err := opts.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrPuzzleRecent)
	}

	puzzles, err := p.repository.GetRecent(ctx, opts)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}

	// Validate results
	for _, puzzle := range puzzles {
		if err := puzzle.Validate(); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
		}
	}

	connection, err := domains.BuildPuzzleConnection(puzzles)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
	}
	if len(connection.Edges) == 0 {
		return connection, nil
	}

	eg := errgroup.Group{}

	eg.Go(func() error {
		next, err := p.repository.GetNextForRecent(ctx, puzzles[len(puzzles)-1].CreatedAt.Format("2006-01-02 15:04:05.000000"))
		if err != nil {
			return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
		}
		if next != nil {
			connection.PageInfo.HasNextPage = true
			connection.PageInfo.NextCursor = domains.NewCursor(next.CreatedAt.Format("2006-01-02 15:04:05.000000"))
		}

		return nil
	})

	eg.Go(func() error {
		if opts.Cursor.IsEmpty() {
			return nil
		}

		previous, err := p.repository.GetPreviousForRecent(ctx, puzzles[0].CreatedAt.Format("2006-01-02 15:04:05.000000"))
		if err != nil {
			return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleRecent)
		}
		if previous != nil {
			connection.PageInfo.HasPreviousPage = true
			connection.PageInfo.PreviousCursor = domains.NewCursor(previous.CreatedAt.Format("2006-01-02 15:04:05.000000"))
		}

		return nil
	})

	if err := eg.Wait(); err != nil {
		return nil, err
	}

	return connection, nil
}

func (p *Puzzle) ToggleLike(ctx context.Context, id ulid.ULID) (*domains.PuzzleLike, error) {
	puzzle, err := p.Find(ctx, id)
	if err != nil {
		return nil, err
	}

	like, err := p.repository.ToggleLike(ctx, puzzle.ID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleToggleLike)
	}

	return like, nil
}

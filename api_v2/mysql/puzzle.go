package mysql

import (
	"context"
	"sort"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

var _ repositories.Puzzle = (*puzzle)(nil)

type puzzle struct {
	db *bun.DB
}

func NewPuzzle(db *bun.DB) repositories.Puzzle {
	logrus.Info("Created Puzzle MySQL Repository")

	return &puzzle{
		db: db,
	}
}

func (p *puzzle) Create(ctx context.Context, newPuzzle domains.Puzzle) (*domains.Puzzle, error) {
	return nil, nil
}

func (p *puzzle) Get(ctx context.Context, id string) (*domains.Puzzle, error) {
	var puzzle domains.Puzzle
	if err := p.db.
		NewSelect().
		Model(&puzzle).
		Relation("Groups").
		Relation("Groups.Blocks").
		Relation("CreatedBy").
		Where("puzzle.id = ?", id).
		Scan(ctx); err != nil {
		return nil, err
	}

	return &puzzle, nil
}

func (p *puzzle) GetCreated(ctx context.Context, userID string, opts domains.PuzzleCursorPaginationOpts) ([]domains.PuzzleSummary, error) {
	session := domains.SessionFromContext(ctx)

	var foundPuzzles []domains.PuzzleSummary

	query := p.db.
		NewSelect().
		Model(&foundPuzzles).
		Column("puzzle_summary.id", "puzzle_summary.difficulty", "puzzle_summary.max_attempts", "puzzle_summary.created_at", "puzzle_summary.updated_at", "puzzle_summary.user_id").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle_summary.id AND active = 1")).
		Relation("CreatedBy").
		Where("puzzle_summary.user_id = ?", userID).
		Group("puzzle_summary.id", "created_by.id").
		OrderExpr("puzzle_summary.created_at DESC").
		Limit(10)

	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle_summary.id AND active = 1 AND user_id = ?", session.UserID.String))
	}

	if !opts.Cursor.IsEmpty() {
		decoded, err := opts.Cursor.Decode()
		if err != nil {
			return nil, err
		}

		query = query.Where("puzzle_summary.created_at <= ?", decoded)
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	for _, puzzle := range foundPuzzles {
		if err := puzzle.Validate(); err != nil {
			return nil, err
		}
	}

	return foundPuzzles, nil
}

func (p *puzzle) GetRecent(ctx context.Context, opts domains.PuzzleCursorPaginationOpts) ([]domains.Puzzle, error) {
	session := domains.SessionFromContext(ctx)

	var puzzles []domains.Puzzle

	// Base query
	query := p.db.
		NewSelect().
		Model(&puzzles).
		Column("puzzle.id", "puzzle.difficulty", "puzzle.max_attempts", "puzzle.created_at", "puzzle.updated_at", "puzzle.user_id").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = 1")).
		Relation("Groups").
		Relation("Groups.Blocks").
		Relation("CreatedBy").
		Group("puzzle.id", "created_by.id").
		Limit(opts.Limit + 1)

		// - Check whether the user has liked the puzzle
		// - Filter out puzzles that the user has already played
	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = 1 AND user_id = ?", session.UserID.String)).
			Join("LEFT JOIN games AS game").
			JoinOn("game.puzzle_id = puzzle.id AND game.user_id = ? AND game.completed_at IS NOT NULL", session.UserID.String).
			Where("game.id IS NULL")
	}

	// Apply pagination
	if !opts.Cursor.IsEmpty() {
		decoded, err := opts.Cursor.Decode()
		if err != nil {
			return nil, err
		}

		if opts.Direction == "B" {
			query = query.
				OrderExpr("puzzle.created_at ASC").
				Where("puzzle.created_at >= ?", decoded)
		} else {
			query = query.
				OrderExpr("puzzle.created_at DESC").
				Where("puzzle.created_at <= ?", decoded)
		}
	}

	// Scan results
	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	// Validate results
	for _, puzzle := range puzzles {
		if err := puzzle.Validate(); err != nil {
			return nil, err
		}
	}

	// Reverse order if we're paginating backwards
	if opts.Direction == "B" {
		sort.Slice(puzzles, func(i, j int) bool {
			return puzzles[i].CreatedAt.After(puzzles[j].CreatedAt)
		})
	}

	return puzzles, nil
}

func (p *puzzle) HasPreviousForRecent(ctx context.Context, cursor string) (bool, error) {
	query := p.db.
		NewSelect().
		Table("puzzles").
		Where("created_at > ?", cursor).
		Limit(1)

	exists, err := query.Exists(ctx)
	if err != nil {
		return false, err
	}

	return exists, nil
}

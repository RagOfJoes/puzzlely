package mysql

import (
	"context"
	"time"

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

func (p *puzzle) GetCreated(ctx context.Context, userID string, cursor domains.Cursor) ([]domains.PuzzleSummary, error) {
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
		query = query.ColumnExpr("(?) AS liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle_summary.id AND active = 1 AND user_id = ?", session.UserID.String))
	}

	if !cursor.IsEmpty() {
		decoded, err := cursor.Decode()
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

func (p *puzzle) GetPopular(ctx context.Context, cursor domains.Cursor) ([]domains.Puzzle, error) {
	session := domains.SessionFromContext(ctx)

	var foundPuzzles []domains.Puzzle

	now := time.Now()
	beginningOfNow := time.Date(now.Year(), now.Month(), 12, 0, 0, 0, 0, now.Location())
	query := p.db.
		NewSelect().
		Model(&foundPuzzles).
		Column("puzzle.id", "puzzle.difficulty", "puzzle.max_attempts", "puzzle.created_at", "puzzle.updated_at", "puzzle.user_id").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = 1 AND updated_at < ?", beginningOfNow.String())).
		Relation("Groups").
		Relation("Groups.Blocks").
		Relation("CreatedBy").
		Group("puzzle.id", "created_by.id").
		OrderExpr("num_of_likes DESC, puzzle.created_at DESC").
		Limit(10)

	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = 1 AND user_id = ?", session.UserID.String)).
			Join("LEFT JOIN games AS game").
			JoinOn("game.puzzle_id = puzzle.id AND game.user_id = ?", session.UserID.String).
			Where("game.id IS NULL")
	}

	if !cursor.IsEmpty() {
		decoded, err := cursor.Decode()
		if err != nil {
			return nil, err
		}

		query = query.Where("puzzle.num_of_likes < 1 AND puzzle.created_at < ?", decoded)
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

func (p *puzzle) GetRecent(ctx context.Context, cursor domains.Cursor) ([]domains.Puzzle, error) {
	session := domains.SessionFromContext(ctx)

	var foundPuzzles []domains.Puzzle

	query := p.db.
		NewSelect().
		Model(&foundPuzzles).
		Column("puzzle.id", "puzzle.difficulty", "puzzle.max_attempts", "puzzle.created_at", "puzzle.updated_at", "puzzle.user_id").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = 1")).
		Relation("Groups").
		Relation("Groups.Blocks").
		Relation("CreatedBy").
		Group("puzzle.id", "created_by.id").
		OrderExpr("puzzle.created_at DESC").
		Limit(10)

	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = 1 AND user_id = ?", session.UserID.String)).
			Join("LEFT JOIN games AS game").
			JoinOn("game.puzzle_id = puzzle.id AND game.user_id = ? AND game.completed_at = NULL", session.UserID.String).
			Where("game.id IS NULL")
	}

	if !cursor.IsEmpty() {
		decoded, err := cursor.Decode()
		if err != nil {
			return nil, err
		}

		query = query.Where("puzzle.created_at <= ?", decoded)
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

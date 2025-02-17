package postgres

import (
	"context"
	"database/sql"
	"errors"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
	"go.opentelemetry.io/otel/trace"
)

var _ repositories.Puzzle = (*puzzle)(nil)

type puzzle struct {
	tracer trace.Tracer

	db *bun.DB
}

func NewPuzzle(db *bun.DB) repositories.Puzzle {
	logrus.Info("Created Puzzle Postgres Repository")

	return &puzzle{
		tracer: telemetry.Tracer("postgres.puzzle"),

		db: db,
	}
}

func (p *puzzle) Create(ctx context.Context, payload domains.Puzzle) (*domains.Puzzle, error) {
	ctx, span := p.tracer.Start(ctx, "Create", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var puzzle domains.Puzzle
	blocks := make([]domains.PuzzleBlock, 0)
	err := p.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		// Flatten payload's groups and append each of its blocks to slice
		newBlocks := make([]domains.PuzzleBlock, 0)
		for _, group := range payload.Groups {
			for _, block := range group.Blocks {
				newBlocks = append(newBlocks, block)
			}
		}

		if _, err := tx.NewInsert().Model(&payload).Returning("*").Exec(ctx, &puzzle); err != nil {
			return err
		}
		if _, err := tx.NewInsert().Model(&payload.Groups).Returning("*").Exec(ctx, &puzzle.Groups); err != nil {
			return err
		}
		if _, err := tx.NewInsert().Model(&newBlocks).Returning("*").Exec(ctx, &blocks); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	// Append blocks to response
	for i := range puzzle.Groups {
		group := &puzzle.Groups[i]
		for _, block := range blocks {
			if block.PuzzleGroupID != group.ID {
				continue
			}

			group.Blocks = append(group.Blocks, block)
		}
	}

	// Append user to response
	puzzle.CreatedBy = payload.CreatedBy

	return &puzzle, nil
}

func (p *puzzle) Get(ctx context.Context, id string) (*domains.Puzzle, error) {
	ctx, span := p.tracer.Start(ctx, "Get", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var puzzle domains.Puzzle
	query := p.db.
		NewSelect().
		Model(&puzzle).
		Column("puzzle.id", "puzzle.difficulty", "puzzle.max_attempts", "puzzle.created_at", "puzzle.updated_at", "puzzle.user_id").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = TRUE")).
		Relation("Groups").
		Relation("Groups.Blocks").
		Relation("CreatedBy").
		Where("puzzle.id = ?", id)

	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = TRUE AND user_id = ?", session.UserID.String))
	}

	if err := query.Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &puzzle, nil
}

func (p *puzzle) GetCreated(ctx context.Context, id string, opts domains.PuzzleCursorPaginationOpts) ([]domains.PuzzleSummary, error) {
	ctx, span := p.tracer.Start(ctx, "GetCreated", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var puzzles []domains.PuzzleSummary
	query := p.db.
		NewSelect().
		Model(&puzzles).
		Column("puzzle_summary.id", "puzzle_summary.difficulty", "puzzle_summary.max_attempts", "puzzle_summary.created_at", "puzzle_summary.updated_at", "puzzle_summary.user_id").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle_summary.id AND active = TRUE")).
		Relation("CreatedBy").
		Where("puzzle_summary.user_id = ?", id).
		Group("puzzle_summary.id", "created_by.id").
		OrderExpr("puzzle_summary.created_at DESC").
		Limit(opts.Limit + 1)

	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS me_liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle_summary.id AND active = TRUE AND user_id = ?", session.UserID.String))
	}

	if !opts.Cursor.IsEmpty() {
		decoded, err := opts.Cursor.Decode()
		if err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			return nil, err
		}

		query = query.Where("puzzle_summary.created_at <= ?", decoded)
	}

	if err := query.Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return puzzles, nil
}

func (p *puzzle) GetLiked(ctx context.Context, id string, opts domains.PuzzleCursorPaginationOpts) ([]domains.PuzzleSummary, error) {
	ctx, span := p.tracer.Start(ctx, "GetLiked", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var puzzles []domains.PuzzleSummary
	query := p.db.
		NewSelect().
		Model(&puzzles).
		Column("puzzle_summary.id", "puzzle_summary.difficulty", "puzzle_summary.max_attempts", "puzzle_summary.created_at", "puzzle_summary.updated_at", "puzzle_summary.user_id").
		ColumnExpr("puzzle_like.updated_at AS user_liked_at").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle_summary.id AND active = TRUE")).
		Relation("CreatedBy").
		Join("LEFT JOIN puzzle_likes AS puzzle_like").JoinOn("puzzle_id = puzzle_summary.id AND active = TRUE").
		Where("puzzle_like.user_id = ?", id).
		Group("puzzle_summary.id", "created_by.id", "puzzle_like.updated_at").
		OrderExpr("puzzle_like.updated_at DESC").
		Limit(opts.Limit + 1)

	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS me_liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle_summary.id AND active = TRUE AND user_id = ?", session.UserID.String))
	}

	if !opts.Cursor.IsEmpty() {
		decoded, err := opts.Cursor.Decode()
		if err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			return nil, err
		}

		query = query.Where("puzzle_like.updated_at <= ?", decoded)
	}

	if err := query.Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return puzzles, nil
}

func (p *puzzle) GetRecent(ctx context.Context, opts domains.PuzzleCursorPaginationOpts) ([]domains.Puzzle, error) {
	ctx, span := p.tracer.Start(ctx, "GetRecent", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var puzzles []domains.Puzzle
	query := p.db.
		NewSelect().
		Model(&puzzles).
		Column("puzzle.id", "puzzle.difficulty", "puzzle.max_attempts", "puzzle.created_at", "puzzle.updated_at", "puzzle.user_id").
		ColumnExpr("(?) AS num_of_likes", p.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = TRUE")).
		Relation("Groups").
		Relation("Groups.Blocks").
		Relation("CreatedBy").
		Group("puzzle.id", "created_by.id").
		Limit(opts.Limit)

		// - Check whether the user has liked the puzzle
		// - Filter out puzzles that the user has already played
	if session != nil && session.IsAuthenticated() {
		query = query.
			ColumnExpr("(?) AS liked_at", p.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = TRUE AND user_id = ?", session.UserID.String)).
			Join("LEFT JOIN games AS game").
			JoinOn("game.puzzle_id = puzzle.id AND game.user_id = ? AND game.completed_at IS NOT NULL", session.UserID.String).
			Where("game.id IS NULL")
	}

	// Apply ORDER BY
	if opts.Direction == "B" {
		query = query.OrderExpr("puzzle.created_at ASC")
	} else {
		query = query.OrderExpr("puzzle.created_at DESC")
	}

	// Apply pagination
	if !opts.Cursor.IsEmpty() {
		decoded, err := opts.Cursor.Decode()
		if err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			return nil, err
		}

		if opts.Direction == "B" {
			query = query.Where("puzzle.created_at >= ?", decoded)
		} else {
			query = query.Where("puzzle.created_at <= ?", decoded)
		}
	}

	// Scan results
	if err := query.Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return puzzles, nil
}

func (p *puzzle) GetNextForRecent(ctx context.Context, cursor string) (*domains.Puzzle, error) {
	ctx, span := p.tracer.Start(ctx, "GetNextForRecent", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var puzzle domains.Puzzle
	query := p.db.
		NewSelect().
		Model(&puzzle).
		Where("puzzle.created_at < ?", cursor).
		OrderExpr("puzzle.created_at DESC").
		Limit(1)

		// - Check whether the user has liked the puzzle
		// - Filter out puzzles that the user has already played
	if session != nil && session.IsAuthenticated() {
		query = query.
			Join("LEFT JOIN games AS game").
			JoinOn("game.puzzle_id = puzzle.id AND game.user_id = ? AND game.completed_at IS NOT NULL", session.UserID.String).
			Where("game.id IS NULL")
	}

	err := query.Scan(ctx)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return &puzzle, nil
}

func (p *puzzle) GetPreviousForRecent(ctx context.Context, cursor string) (*domains.Puzzle, error) {
	ctx, span := p.tracer.Start(ctx, "GetPreviousForRecent", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var puzzle domains.Puzzle
	query := p.db.
		NewSelect().
		Model(&puzzle).
		Where("puzzle.created_at > ?", cursor).
		OrderExpr("puzzle.created_at ASC").
		Limit(1)

		// - Check whether the user has liked the puzzle
		// - Filter out puzzles that the user has already played
	if session != nil && session.IsAuthenticated() {
		query = query.
			Join("LEFT JOIN games AS game").
			JoinOn("game.puzzle_id = puzzle.id AND game.user_id = ? AND game.completed_at IS NOT NULL", session.UserID.String).
			Where("game.id IS NULL")
	}

	err := query.Scan(ctx)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return &puzzle, nil
}

func (p *puzzle) ToggleLike(ctx context.Context, id string) (*domains.PuzzleLike, error) {
	ctx, span := p.tracer.Start(ctx, "ToggleLike", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var like domains.PuzzleLike
	_, err := p.db.NewInsert().
		Model(&domains.PuzzleLike{
			ID:     ulid.Make().String(),
			Active: true,

			PuzzleID: id,
			UserID:   session.UserID.String,
		}).
		On("CONFLICT (puzzle_id, user_id) DO UPDATE").
		Set("active = NOT puzzle_like.active").
		Set("updated_at = CURRENT_TIMESTAMP").
		Returning("*").
		Exec(ctx, &like)

	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &like, nil
}

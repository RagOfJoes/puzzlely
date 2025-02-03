package postgres

import (
	"context"
	"database/sql"
	"errors"
	"sort"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
	"go.opentelemetry.io/otel/trace"
	"golang.org/x/sync/errgroup"
)

var _ repositories.Game = (*game)(nil)

type game struct {
	tracer trace.Tracer

	db *bun.DB
}

func NewGame(db *bun.DB) repositories.Game {
	logrus.Info("Created Game Postgres Repository")

	return &game{
		tracer: telemetry.Tracer("postgres.game"),

		db: db,
	}
}

func (g *game) GetWithPuzzleID(ctx context.Context, id string) (*domains.Game, error) {
	ctx, span := g.tracer.Start(ctx, "GetWithPuzzleID", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var game domains.Game
	query := g.db.NewSelect().
		Model(&game).
		Relation("Puzzle", func(q *bun.SelectQuery) *bun.SelectQuery {
			puzzleQuery := q.
				Column("id", "difficulty", "max_attempts", "created_at", "updated_at", "user_id").
				ColumnExpr("(?) AS puzzle__num_of_likes", g.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = game.puzzle_id AND active = TRUE"))

			if session != nil && session.IsAuthenticated() {
				puzzleQuery = puzzleQuery.
					ColumnExpr("(?) AS puzzle__liked_at", g.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = game.puzzle_id AND active = TRUE AND user_id = ?", session.UserID.String))
			}

			return puzzleQuery
		}).
		Relation("Puzzle.Groups").
		Relation("Puzzle.Groups.Blocks").
		Relation("Puzzle.CreatedBy").
		Relation("User").
		Where("puzzle_id = ?", id).
		Where("game.user_id = ?", session.UserID).
		Group("game.id", "puzzle.id", "puzzle__created_by.id", "user.id")

	if err := query.Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	game.Attempts = make([][]string, 0)
	game.Correct = make([]string, 0)

	eg := errgroup.Group{}
	eg.Go(func() error {
		attempts := make([]domains.GameAttempt, 0)

		err := g.db.NewSelect().
			Model(&attempts).
			Where("game_id = ?", game.ID).
			Order("attempt_order ASC", "selection_order ASC").
			Group("id", "attempt_order").
			Scan(ctx)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		grouped := make(map[int][]domains.GameAttempt, 0)
		for _, attempt := range attempts {
			grouped[attempt.AttemptOrder] = append(grouped[attempt.AttemptOrder], attempt)
		}

		for i := 0; i < len(grouped); i += 1 {
			group, ok := grouped[i]
			if !ok {
				continue
			}

			sort.Slice(group, func(i, j int) bool {
				return group[i].SelectionOrder < group[j].SelectionOrder
			})

			ids := make([]string, 0)
			for _, attempt := range group {
				ids = append(ids, attempt.PuzzleBlockID)
			}

			game.Attempts = append(game.Attempts, ids)
		}

		return nil
	})

	eg.Go(func() error {
		correct := make([]domains.GameCorrect, 0)

		err := g.db.NewSelect().
			Model(&correct).
			Where("game_id = ?", game.ID).
			Order("order ASC").
			Scan(ctx)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		sort.Slice(correct, func(i, j int) bool {
			return correct[i].Order < correct[j].Order
		})

		for _, c := range correct {
			game.Correct = append(game.Correct, c.PuzzleGroupID)
		}

		return nil
	})

	if err := eg.Wait(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &game, nil
}

func (g *game) GetHistory(ctx context.Context, id string, opts domains.GameCursorPaginationOpts) ([]domains.GameSummary, error) {
	ctx, span := g.tracer.Start(ctx, "GetHistory", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	var games []domains.GameSummary
	query := g.db.
		NewSelect().
		Model(&games).
		Column("id", "score", "created_at", "completed_at", "puzzle_id", "user_id").
		ColumnExpr("(?) AS attempts", g.db.NewRaw("SELECT COUNT(DISTINCT(attempt_order)) FROM game_attempts WHERE game_id = game_summary.id")).
		Relation("Puzzle", func(q *bun.SelectQuery) *bun.SelectQuery {
			q = q.
				Column("id", "difficulty", "max_attempts", "created_at", "updated_at", "user_id").
				ColumnExpr("(?) AS puzzle__num_of_likes", g.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = game_summary.puzzle_id AND active = TRUE"))

			if session != nil && session.IsAuthenticated() {
				q = q.ColumnExpr("(?) AS puzzle__me_liked_at", g.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = game_summary.puzzle_id AND active = TRUE AND user_id = ?", session.UserID.String))
			}

			return q
		}).
		Relation("Puzzle.CreatedBy").
		Relation("User").
		Where("game_summary.user_id = ?", id).
		Group("game_summary.id", "puzzle.id", "puzzle__created_by.id", "user.id").
		OrderExpr("game_summary.created_at DESC").
		Limit(opts.Limit + 1)

	if !opts.Cursor.IsEmpty() {
		decoded, err := opts.Cursor.Decode()
		if err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			return nil, err
		}

		query = query.Where("game_summary.created_at <= ?", decoded)
	}

	if err := query.Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return games, nil
}

func (g *game) Save(ctx context.Context, payload domains.Game) (*domains.Game, error) {
	ctx, span := g.tracer.Start(ctx, "Save", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var game domains.Game
	if err := g.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		_, err := g.db.NewInsert().
			Model(&domains.Game{
				ID:    ulid.Make().String(),
				Score: payload.Score,

				CreatedAt:   payload.CompletedAt.Time,
				CompletedAt: payload.CompletedAt,

				PuzzleID: payload.PuzzleID,
				UserID:   payload.UserID,
			}).
			On("CONFLICT (puzzle_id, user_id) DO UPDATE").
			Set("score = ?", payload.Score).
			Set("completed_at = ?", payload.CompletedAt).
			Returning("*").
			Exec(ctx, &game)
		if err != nil {
			return err
		}

		if _, err := g.db.NewDelete().
			Model((*domains.GameAttempt)(nil)).
			Where("game_id = ?", game.ID).
			Exec(ctx); err != nil {
			return err
		}

		if _, err := g.db.NewDelete().
			Model((*domains.GameCorrect)(nil)).
			Where("game_id = ?", game.ID).
			Exec(ctx); err != nil {
			return err
		}

		if len(payload.Attempts) > 0 {
			attempts := make([]domains.GameAttempt, 0)
			for i, attempt := range payload.Attempts {
				for j, id := range attempt {
					attempts = append(attempts, domains.GameAttempt{
						ID:             ulid.Make().String(),
						AttemptOrder:   i,
						SelectionOrder: j,

						PuzzleBlockID: id,
						GameID:        game.ID,
					})
				}
			}

			if _, err := g.db.NewInsert().
				Model(&attempts).
				Exec(ctx); err != nil {
				return err
			}
		}

		if len(payload.Correct) > 0 {
			correct := make([]domains.GameCorrect, 0)
			for i, id := range payload.Correct {
				correct = append(correct, domains.GameCorrect{
					ID:    ulid.Make().String(),
					Order: i,

					PuzzleGroupID: id,
					GameID:        game.ID,
				})
			}

			if _, err := g.db.NewInsert().
				Model(&correct).
				Exec(ctx); err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	game.Attempts = payload.Attempts
	game.Correct = payload.Correct

	game.Puzzle = payload.Puzzle
	game.User = payload.User

	return &game, nil
}

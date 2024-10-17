package mysql

import (
	"context"
	"sync"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

var _ repositories.Game = (*game)(nil)

type game struct {
	db *bun.DB
}

func NewGame(db *bun.DB) repositories.Game {
	logrus.Info("Created Game MySQL Repository")

	return &game{
		db: db,
	}
}

func (g *game) Create(ctx context.Context, newGame domains.Game) (*domains.Game, error) {
	if _, err := g.db.NewInsert().Model(&newGame).Exec(ctx); err != nil {
		return nil, err
	}

	return &newGame, nil
}

func (g *game) GetWithPuzzleID(ctx context.Context, puzzleID string) (*domains.Game, error) {
	session := domains.SessionFromContext(ctx)

	var game domains.Game

	query := g.db.NewSelect().
		Model(&game).
		Relation("Puzzle", func(q *bun.SelectQuery) *bun.SelectQuery {
			puzzleQuery := q.
				Column("id", "difficulty", "max_attempts", "created_at", "updated_at", "user_id").
				ColumnExpr("(?) AS puzzle__num_of_likes", g.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = game.puzzle_id AND active = 1"))

			if session != nil && session.IsAuthenticated() {
				puzzleQuery = puzzleQuery.
					ColumnExpr("(?) AS puzzle__liked_at", g.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = game.puzzle_id AND active = 1 AND user_id = ?", session.UserID.String))
			}

			return puzzleQuery
		}).
		Relation("Puzzle.Groups").
		Relation("Puzzle.Groups.Blocks").
		Relation("Puzzle.CreatedBy").
		Relation("User").
		Where("completed_at IS NOT NULL AND puzzle_id = ?", puzzleID).
		Group("game.id")

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()

		var foundAttempts []domains.GameAttempt
		if err := g.db.NewSelect().
			Model(&foundAttempts).
			Where("game_id = ?", game.ID).
			Order("attempt_order ASC").
			Scan(ctx); err != nil {
			return
		}

		groupAttempts := map[uint16][]string{}
		for _, attempt := range foundAttempts {
			if err := attempt.Validate(); err != nil {
				return
			}

			groupAttempts[attempt.AttemptOrder] = append(groupAttempts[attempt.AttemptOrder], attempt.PuzzleBlockID)
		}

		game.Attempts = [][]string{}
		for _, attempts := range groupAttempts {
			game.Attempts = append(game.Attempts, attempts)
		}
	}()

	go func() {
		defer wg.Done()

		var foundCorrect []domains.GameCorrect
		if err := g.db.NewSelect().
			Model(&foundCorrect).
			Where("game_id = ?", game.ID).
			Order("order ASC").
			Scan(ctx); err != nil {
			return
		}

		game.Correct = []string{}
		for _, correct := range foundCorrect {
			if err := correct.Validate(); err != nil {
				return
			}

			game.Correct = append(game.Correct, correct.PuzzleGroupID)
		}
	}()

	wg.Wait()

	if err := game.Validate(); err != nil {
		return nil, err
	}

	return &game, nil
}

func (g *game) GetHistory(ctx context.Context, cursor domains.Cursor, user domains.User) ([]domains.GameSummary, error) {
	session := domains.SessionFromContext(ctx)

	var foundGames []domains.GameSummary

	query := g.db.
		NewSelect().
		Model(&foundGames).
		Relation("Puzzle", func(q *bun.SelectQuery) *bun.SelectQuery {
			puzzleQuery := q.
				Column("id", "difficulty", "max_attempts", "created_at", "updated_at", "user_id").
				ColumnExpr("(?) AS puzzle__num_of_likes", g.db.NewRaw("SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = game_summary.puzzle_id AND active = 1"))

			if session != nil && session.IsAuthenticated() {
				puzzleQuery = puzzleQuery.
					ColumnExpr("(?) AS puzzle__liked_at", g.db.NewRaw("SELECT updated_at FROM puzzle_likes WHERE puzzle_id = game_summary.puzzle_id AND active = 1 AND user_id = ?", session.UserID.String))
			}

			return puzzleQuery
		}).
		Relation("Puzzle.CreatedBy").
		Relation("User").
		Group("game_summary.id").
		OrderExpr("game_summary.completed_at DESC").
		Where("game_summary.completed_at IS NOT NULL").
		Limit(10)

	if !cursor.IsEmpty() {
		decoded, err := cursor.Decode()
		if err != nil {
			return nil, err
		}

		query = query.Where("game_summary.completed_at <= ?", decoded)
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	for _, game := range foundGames {
		if err := game.Validate(); err != nil {
			return nil, err
		}
	}

	return foundGames, nil
}

func (g *game) Update(ctx context.Context, updateGame domains.Game) error {
	panic("unimplemented")
}

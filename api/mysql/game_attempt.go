package mysql

import (
	"context"
	"fmt"
	"sort"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

// Helper function that retrieves failed attempts for a game
func (g *game) attempts(ctx context.Context, game models.Game) ([][]uuid.UUID, error) {
	query, args, err := squirrel.
		Select("attempt.order", "attempt.puzzle_block_id").
		From(fmt.Sprintf("%s attempt", new(models.GameAttempt).TableName())).
		Where("attempt.game_id = ?", game.ID).
		ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := g.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := map[uint16][]uuid.UUID{}
	for rows.Next() {
		var attemptModel models.GameAttempt

		if err := rows.Scan(
			&attemptModel.Order,
			&attemptModel.PuzzleBlockID,
		); err != nil {
			return nil, err
		}

		order := uint16(attemptModel.Order.Int16)
		ids[order] = append(ids[order], attemptModel.PuzzleBlockID)
	}

	var orders []int
	for order := range ids {
		orders = append(orders, int(order))
	}
	sort.Ints(orders)

	attempts := [][]uuid.UUID{}
	for _, order := range orders {
		attempts = append(attempts, ids[uint16(order)])
	}

	return attempts, nil
}

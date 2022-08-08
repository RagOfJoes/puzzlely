package mysql

import (
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

func (p *puzzle) GetLikedAt(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]*time.Time, error) {
	user := entities.UserFromContext(ctx)

	if user == nil {
		likes := map[uuid.UUID]*time.Time{}
		for _, puzzleID := range ids {
			likes[puzzleID] = nil
		}

		return likes, nil
	}

	query, args, err := squirrel.
		Select(
			"puzzle_like.active",
			"puzzle_like.created_at",
			"puzzle_like.updated_at",
			"puzzle_like.puzzle_id",
		).
		From(fmt.Sprintf("%s puzzle_like", new(models.PuzzleLike).TableName())).
		Where(squirrel.Eq{
			"puzzle_like.active":    true,
			"puzzle_like.puzzle_id": ids,
			"puzzle_like.user_id":   user.ID,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := p.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	likes := map[uuid.UUID]*time.Time{}
	for rows.Next() {
		var like models.PuzzleLike

		if err := rows.Scan(
			&like.Active,
			&like.CreatedAt,
			&like.UpdatedAt,
			&like.PuzzleID,
		); err != nil {
			return nil, err
		}

		if like.PuzzleID == uuid.Nil {
			continue
		}
		if !like.Active {
			likes[like.PuzzleID] = nil
			continue
		}

		likes[like.PuzzleID] = &like.UpdatedAt
	}

	return likes, nil
}

package mysql

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
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
		From(fmt.Sprintf("%s puzzle_like", PuzzleLikeTable)).
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

func (p *puzzle) ToggleLike(ctx context.Context, id uuid.UUID) (*entities.PuzzleLike, error) {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return nil, ErrUserNotFound
	}

	now := time.Now()

	existQuery, existArgs, err := squirrel.
		Select(
			"id",
			"active",
			"created_at",
			"updated_at",
		).
		From(PuzzleLikeTable).
		Where("puzzle_id = ? AND user_id = ?", id, user.ID).
		ToSql()
	if err != nil {
		return nil, err
	}

	existRow := p.db.QueryRowContext(ctx, existQuery, existArgs...)

	var likeModel models.PuzzleLike

	switch existRow.Scan(&likeModel.ID, &likeModel.Active, &likeModel.CreatedAt, &likeModel.UpdatedAt) {
	case nil:
		query, args, err := squirrel.
			Update(PuzzleLikeTable).
			Where("puzzle_id = ? AND user_id = ?", id, user.ID).
			SetMap(map[string]any{
				"active":     !likeModel.Active,
				"updated_at": now,
			}).
			ToSql()
		if err != nil {
			return nil, err
		}

		if _, err := p.db.ExecContext(ctx, query, args...); err != nil {
			return nil, err
		}

		like := dtos.PuzzleLike().ToEntity(likeModel)
		like.Active = !likeModel.Active
		like.UpdatedAt = now

		return &like, nil
	case sql.ErrNoRows:
		newID := uuid.New()
		query, args, err := squirrel.
			Insert(PuzzleLikeTable).
			SetMap(map[string]any{
				"id":         newID,
				"active":     true,
				"created_at": now,
				"updated_at": now,
				"puzzle_id":  id,
				"user_id":    user.ID,
			}).
			ToSql()
		if err != nil {
			return nil, err
		}

		if _, err := p.db.ExecContext(ctx, query, args...); err != nil {
			return nil, err
		}

		newEntity := entities.PuzzleLike{
			ID:        newID,
			Active:    true,
			CreatedAt: now,
			UpdatedAt: now,
		}

		return &newEntity, nil
	default:
		return nil, err
	}
}

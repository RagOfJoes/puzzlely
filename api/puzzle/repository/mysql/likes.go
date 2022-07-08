package mysql

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// LikedAt checks whether user, if not nil, likes a single puzzle
func LikedAt(db *sqlx.DB, id uuid.UUID, currentUser *uuid.UUID) (*time.Time, error) {
	if currentUser == nil || *currentUser == uuid.Nil {
		return nil, nil
	}

	var model Like
	query, args, err := squirrel.Select(
		"puzzle_like.active",
		"puzzle_like.created_at",
		"puzzle_like.updated_at",
	).From(fmt.Sprintf("%s puzzle_like", ms.PuzzleLikesTable)).Where(squirrel.And{
		squirrel.Eq{
			"puzzle_like.active":    true,
			"puzzle_like.puzzle_id": id,
			"puzzle_like.user_id":   currentUser,
		},
	}).ToSql()
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	row, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	for row.Next() {
		if err := row.Scan(&model.Active, &model.CreatedAt, &model.UpdatedAt); err != nil {
			return nil, err
		}
	}

	if !model.Active {
		return nil, nil
	}
	if model.UpdatedAt != nil {
		return model.UpdatedAt, nil
	}
	return &model.CreatedAt, nil
}

// LikedAtList checks whether user, if not nil, likes a list of puzzles
func LikedAtList(db *sqlx.DB, ids []uuid.UUID, currentUser *uuid.UUID) (map[uuid.UUID]*time.Time, error) {
	if currentUser == nil || *currentUser == uuid.Nil {
		models := map[uuid.UUID]*time.Time{}
		for _, id := range ids {
			models[id] = nil
		}
		return models, nil
	}

	models := map[uuid.UUID]*time.Time{}
	query, args, err := squirrel.Select(
		"puzzle_like.active",
		"puzzle_like.created_at",
		"puzzle_like.updated_at",
		"puzzle_like.puzzle_id",
	).From(fmt.Sprintf("%s puzzle_like", ms.PuzzleLikesTable)).Where(squirrel.Eq{
		"puzzle_like.active":    true,
		"puzzle_like.puzzle_id": ids,
		"puzzle_like.user_id":   currentUser,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var model Like
		if err := rows.Scan(&model.Active, &model.CreatedAt, &model.UpdatedAt, &model.PuzzleID); err != nil {
			return nil, err
		}

		if !model.Active {
			models[model.PuzzleID] = nil
			continue
		}

		likedAt := &model.CreatedAt
		if model.UpdatedAt != nil {
			likedAt = model.UpdatedAt
		}
		models[model.PuzzleID] = likedAt
	}

	return models, nil
}

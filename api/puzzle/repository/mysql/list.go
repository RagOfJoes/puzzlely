package mysql

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	"github.com/RagOfJoes/puzzlely/puzzle"
	userMySQL "github.com/RagOfJoes/puzzlely/user/repository/mysql"
	"github.com/google/uuid"
)

// Helper function that'll generate a SQL query for a list of puzzles
func (m *mysqlDB) listBuilder(ctx context.Context, params pagination.Params, filters puzzle.Filters) squirrel.SelectBuilder {
	limit := params.Limit

	builder := squirrel.Select(
		"puzzle.id",
		"puzzle.name",
		"puzzle.description",
		"puzzle.difficulty",
		"puzzle.max_attempts",
		"puzzle.time_allowed",
		"puzzle.created_at",
		"puzzle.updated_at",
		"puzzle.user_id",
		"user.id",
		"user.state",
		"user.username",
		"user.created_at",
		"user.updated_at",
		"(SELECT COUNT(id) FROM puzzle_likes WHERE puzzle_id = puzzle.id AND active = true) AS num_of_likes",
	).From(fmt.Sprintf("%s puzzle", ms.PuzzlesTable))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", ms.UsersTable))

	// Apply filters
	where := squirrel.And{
		squirrel.Eq{
			"puzzle.deleted_at": nil,
			"user.deleted_at":   nil,
		},
	}
	if filters.CustomizableAttempts != nil {
		var condition squirrel.Sqlizer = squirrel.Gt{
			"puzzle.max_attempts": 0,
		}
		if *filters.CustomizableAttempts {
			condition = squirrel.Eq{
				"puzzle.max_attempts": 0,
			}
		}
		where = append(where, condition)
	}
	if filters.CustomizableTime != nil {
		var condition squirrel.Sqlizer = squirrel.Gt{
			"puzzle.time_allowed": 0,
		}
		if *filters.CustomizableTime {
			condition = squirrel.Eq{
				"puzzle.time_allowed": 0,
			}
		}
		where = append(where, condition)
	}
	if filters.Difficulty != nil {
		where = append(where, squirrel.Eq{
			"puzzle.difficulty": *filters.Difficulty,
		})
	}
	if filters.NumOfLikes != nil {
		builder = builder.Having("num_of_likes >= ?", *filters.NumOfLikes)
	}
	// Where
	builder = builder.Where(where)
	// Limit
	builder = builder.Limit(uint64(limit))
	// GroupBy
	builder = builder.GroupBy("puzzle.id", "user.id")

	return builder
}

// Helper function that'll query for a list of Puzzles
func (m *mysqlDB) listQuery(ctx context.Context, builder squirrel.SelectBuilder, currentUser *uuid.UUID) ([]*puzzle.Node, error) {
	query, args, err := builder.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// This array helps maintain order of list
	ids := []uuid.UUID{}
	likes := map[uuid.UUID]uint{}
	models := map[uuid.UUID]Puzzle{}
	usersMap := map[uuid.UUID]userMySQL.User{}

	for rows.Next() {
		var model Puzzle
		var numOfLikesModel uint
		var userModel userMySQL.User
		if err := rows.Scan(
			&model.ID,
			&model.Name,
			&model.Description,
			&model.Difficulty,
			&model.MaxAttempts,
			&model.TimeAllowed,
			&model.CreatedAt,
			&model.UpdatedAt,
			&model.UserID,
			&userModel.ID,
			&userModel.State,
			&userModel.Username,
			&userModel.CreatedAt,
			&userModel.UpdatedAt,
			&numOfLikesModel,
		); err != nil {
			return nil, err
		}

		if _, ok := models[model.ID]; !ok {
			ids = append(ids, model.ID)
			models[model.ID] = model
		}
		if _, ok := likes[model.ID]; !ok {
			likes[model.ID] = numOfLikesModel
		}
		if _, ok := usersMap[model.UserID]; !ok {
			usersMap[model.UserID] = userModel
		}
	}

	likedAtMap, err := LikedAtList(m.db, ids, currentUser)
	if err != nil {
		return nil, err
	}

	var entities []*puzzle.Node
	for _, id := range ids {
		model, ok := models[id]
		if !ok {
			continue
		}

		entity := model.ToNodeEntity()
		if val, ok := likes[model.ID]; ok {
			entity.NumOfLikes = val
		}
		if val, ok := likedAtMap[model.ID]; ok {
			entity.LikedAt = val
		}
		if val, ok := usersMap[model.UserID]; ok {
			entity.CreatedBy = val.ToEntity()
		}
		entities = append(entities, &entity)
	}

	return entities, err
}

package mysql

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

// Builds base SQL query that fetches a list of puzzle nodes
func (p *puzzle) listBuilder(ctx context.Context, params entities.Pagination, filters entities.PuzzleFilters) squirrel.SelectBuilder {
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
	).From(fmt.Sprintf("%s puzzle", PuzzleTable))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", UserTable))

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

// Runs query that fetches a list of puzzle nodes
func (p *puzzle) listQuery(ctx context.Context, builder squirrel.SelectBuilder) ([]entities.PuzzleNode, error) {
	ctx, span := p.tracer.Start(ctx, "listQuery")
	defer span.End()

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := p.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// This array helps maintain order of list
	ids := []uuid.UUID{}

	puzzleMap := map[uuid.UUID]models.Puzzle{}
	likes := map[uuid.UUID]uint{}
	userMap := map[uuid.UUID]models.User{}

	for rows.Next() {
		var puzzleModel models.Puzzle
		var numOfLikesModel uint
		var userModel models.User

		if err := rows.Scan(
			&puzzleModel.ID,
			&puzzleModel.Name,
			&puzzleModel.Description,
			&puzzleModel.Difficulty,
			&puzzleModel.MaxAttempts,
			&puzzleModel.TimeAllowed,
			&puzzleModel.CreatedAt,
			&puzzleModel.UpdatedAt,
			&puzzleModel.UserID,
			&userModel.ID,
			&userModel.State,
			&userModel.Username,
			&userModel.CreatedAt,
			&userModel.UpdatedAt,
			&numOfLikesModel,
		); err != nil {
			return nil, err
		}

		if _, ok := puzzleMap[puzzleModel.ID]; !ok {
			ids = append(ids, puzzleModel.ID)
			puzzleMap[puzzleModel.ID] = puzzleModel
		}
		if _, ok := likes[puzzleModel.ID]; !ok {
			likes[puzzleModel.ID] = numOfLikesModel
		}
		if _, ok := userMap[puzzleModel.UserID]; !ok {
			userMap[puzzleModel.UserID] = userModel
		}
	}

	likedAtMap, err := p.GetLikedAt(ctx, ids)
	if err != nil {
		return nil, err
	}

	var nodes []entities.PuzzleNode
	for _, id := range ids {
		puzzleModel, ok := puzzleMap[id]
		if !ok {
			continue
		}

		puzzle := dtos.Puzzle().ToNode(puzzleModel)
		if numsOfLike, ok := likes[puzzleModel.ID]; ok {
			puzzle.NumOfLikes = numsOfLike
		}
		if likedAt, ok := likedAtMap[puzzle.ID]; ok {
			puzzle.LikedAt = likedAt
		}
		if userModel, ok := userMap[puzzleModel.UserID]; ok {
			puzzle.CreatedBy = dtos.User().ToEntity(userModel)
		}

		nodes = append(nodes, puzzle)
	}

	return nodes, err
}

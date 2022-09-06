package mysql

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type puzzle struct {
	db *sqlx.DB
}

func NewPuzzle(db *sqlx.DB) repositories.Puzzle {
	logrus.Info("Created Puzzle MySQL Repository")

	return &puzzle{
		db: db,
	}
}

func (p *puzzle) Create(ctx context.Context, newPuzzle entities.Puzzle) (*entities.Puzzle, error) {
	puzzleModel := dtos.Puzzle().ToModel(newPuzzle)

	var groupModels []models.PuzzleGroup
	var answerModels []models.PuzzleGroupAnswer
	var blockModels []models.PuzzleBlock
	for _, group := range newPuzzle.Groups {
		groupModel := dtos.PuzzleGroup().ToModel(group)
		groupModel.PuzzleID = puzzleModel.ID

		groupModels = append(groupModels, groupModel)
		for _, block := range group.Blocks {
			blockModels = append(blockModels, dtos.PuzzleBlock().ToModel(block))
		}

		for _, answer := range group.Answers {
			answerID := uuid.New()
			answerModels = append(answerModels, models.PuzzleGroupAnswer{
				Bare: models.Bare{
					ID: answerID,
				},

				Answer:        answer,
				PuzzleGroupID: group.ID,
			})
		}
	}

	puzzleQuery, puzzleArgs, err := squirrel.
		Insert(PuzzleTable).
		SetMap(map[string]interface{}{
			"id":           puzzleModel.ID,
			"name":         puzzleModel.Name,
			"description":  puzzleModel.Description,
			"difficulty":   puzzleModel.Difficulty,
			"max_attempts": puzzleModel.MaxAttempts,
			"time_allowed": puzzleModel.TimeAllowed,
			"created_at":   puzzleModel.CreatedAt,
			"user_id":      puzzleModel.UserID,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}
	groupInsert := squirrel.
		Insert(PuzzleGroupTable).
		Columns("id", "description", "puzzle_id")
	for _, group := range groupModels {
		groupInsert = groupInsert.Values(group.ID, group.Description, puzzleModel.ID)
	}
	groupQuery, groupArgs, err := groupInsert.ToSql()
	if err != nil {
		return nil, err
	}
	answerInsert := squirrel.
		Insert(PuzzleGroupAnswerTable).
		Columns("id", "answer", "puzzle_group_id")
	for _, answer := range answerModels {
		answerInsert = answerInsert.Values(answer.ID, answer.Answer, answer.PuzzleGroupID)
	}
	answerQuery, answerArgs, err := answerInsert.ToSql()
	if err != nil {
		return nil, err
	}
	blockInsert := squirrel.
		Insert(PuzzleBlockTable).
		Columns("id", "value", "puzzle_group_id")
	for _, block := range blockModels {
		blockInsert = blockInsert.Values(block.ID, block.Value, block.GroupID)
	}
	blockQuery, blockArgs, err := blockInsert.ToSql()
	if err != nil {
		return nil, err
	}

	tx, err := p.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, puzzleQuery, puzzleArgs...); err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, groupQuery, groupArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, answerQuery, answerArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, blockQuery, blockArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return nil, err
	}

	return &newPuzzle, nil
}

func (p *puzzle) Get(ctx context.Context, id uuid.UUID) (*entities.Puzzle, error) {
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
		"puzzle_group.id",
		"puzzle_group.description",
		"puzzle_group.puzzle_id",
		"puzzle_group_answer.id",
		"puzzle_group_answer.answer",
		"puzzle_group_answer.puzzle_group_id",
		"puzzle_block.id",
		"puzzle_block.value",
		"puzzle_block.puzzle_group_id",
		"user.id",
		"user.state",
		"user.username",
		"user.created_at",
		"user.updated_at",
		"COUNT(puzzle_like.id) AS num_of_likes",
	).From(fmt.Sprintf("%s puzzle", PuzzleTable))
	// Join Puzzle Group
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_group ON puzzle_group.puzzle_id = puzzle.id", PuzzleGroupTable))
	// Join Puzzle Group Answer
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_group_answer ON puzzle_group_answer.puzzle_group_id = puzzle_group.id", PuzzleGroupAnswerTable))
	// Join Puzzle Block
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_block ON puzzle_block.puzzle_group_id = puzzle_group.id", PuzzleBlockTable))
	// Join Puzzle Like
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = puzzle.id AND puzzle_like.active = true", PuzzleLikeTable))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", UserTable))
	// Where
	builder = builder.Where("puzzle.id = ? AND puzzle.deleted_at IS NULL AND user.deleted_at IS NULL", id)
	// GroupBy
	builder = builder.GroupBy("puzzle.id", "puzzle_group.id", "puzzle_group_answer.id", "puzzle_block.id", "user.id")

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := p.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var puzzleModel models.Puzzle
	var userModel models.User

	var numOfLikes uint
	uuidMap := map[uuid.UUID]bool{}
	groupMap := map[uuid.UUID]models.PuzzleGroup{}
	answerMap := map[uuid.UUID][]models.PuzzleGroupAnswer{}
	blockMap := map[uuid.UUID][]models.PuzzleBlock{}

	for rows.Next() {
		var groupModel models.PuzzleGroup
		var groupAnswerModel models.PuzzleGroupAnswer
		var blockModel models.PuzzleBlock

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
			&groupModel.ID,
			&groupModel.Description,
			&groupModel.PuzzleID,
			&groupAnswerModel.ID,
			&groupAnswerModel.Answer,
			&groupAnswerModel.PuzzleGroupID,
			&blockModel.ID,
			&blockModel.Value,
			&blockModel.GroupID,
			&userModel.ID,
			&userModel.State,
			&userModel.Username,
			&userModel.CreatedAt,
			&userModel.UpdatedAt,
			&numOfLikes,
		); err != nil {
			return nil, err
		}

		if _, ok := uuidMap[blockModel.ID]; !ok {
			uuidMap[blockModel.ID] = true
			blockMap[groupModel.ID] = append(blockMap[groupModel.ID], blockModel)
		}
		if _, ok := uuidMap[groupAnswerModel.ID]; !ok {
			uuidMap[groupAnswerModel.ID] = true
			answerMap[groupModel.ID] = append(answerMap[groupModel.ID], groupAnswerModel)
		}
		if _, ok := groupMap[groupModel.ID]; !ok {
			groupMap[groupModel.ID] = groupModel
		}
	}

	if puzzleModel.ID == uuid.Nil {
		return nil, errors.New("puzzle not found")
	}

	likedAtMap, err := p.GetLikedAt(ctx, []uuid.UUID{puzzleModel.ID})
	if err != nil {
		return nil, err
	}

	puzzle := dtos.Puzzle().ToEntity(puzzleModel)
	puzzle.LikedAt = likedAtMap[puzzleModel.ID]
	puzzle.NumOfLikes = numOfLikes
	puzzle.CreatedBy = dtos.User().ToEntity(userModel)
	for _, groupModel := range groupMap {
		group := dtos.PuzzleGroup().ToEntity(groupModel)

		for _, answer := range answerMap[groupModel.ID] {
			group.Answers = append(group.Answers, answer.Answer)
		}
		for _, block := range blockMap[groupModel.ID] {
			group.Blocks = append(group.Blocks, dtos.PuzzleBlock().ToEntity(block))
		}

		puzzle.Groups = append(puzzle.Groups, group)
	}

	return &puzzle, nil
}

func (p *puzzle) GetCreated(ctx context.Context, params entities.Pagination, userID uuid.UUID) ([]entities.PuzzleNode, error) {
	cursor, err := params.Cursor.Decode()
	if err != nil {
		return nil, err
	}

	sortKey := params.SortKey
	sortOrder := params.SortOrder

	builder := p.listBuilder(ctx, params, entities.PuzzleFilters{})
	// Where
	where := squirrel.And{
		squirrel.Eq{
			"puzzle.user_id": userID,
		},
	}
	if cursor != "" {
		if sortOrder == "ASC" {
			where = append(where, squirrel.GtOrEq{
				fmt.Sprintf("puzzle.%s", sortKey): cursor,
			})
		} else {
			where = append(where, squirrel.LtOrEq{
				fmt.Sprintf("puzzle.%s", sortKey): cursor,
			})
		}
	}
	builder = builder.Where(where)
	// OrderBy
	builder = builder.OrderBy(fmt.Sprintf("puzzle.%s %s", sortKey, sortOrder))

	nodes, err := p.listQuery(ctx, builder)
	if err != nil {
		return nil, err
	}

	return nodes, nil
}

func (p *puzzle) GetLiked(ctx context.Context, params entities.Pagination) ([]entities.PuzzleNode, error) {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return nil, ErrUserNotFound
	}

	cursor, err := params.Cursor.Decode()
	if err != nil {
		return nil, err
	}

	builder := p.listBuilder(ctx, params, entities.PuzzleFilters{})
	// Join Puzzle Like
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = puzzle.id AND puzzle_like.active = true", PuzzleLikeTable))
	// Where
	where := squirrel.And{
		squirrel.Eq{
			"puzzle_like.active":  true,
			"puzzle_like.user_id": user.ID,
		},
		squirrel.NotEq{
			"puzzle_like.updated_at": nil,
		},
	}
	if cursor != "" {
		where = append(where, squirrel.LtOrEq{
			"puzzle_like.updated_at": cursor,
		})
	}
	builder = builder.Where(where)
	// OrderBy
	builder = builder.OrderBy("puzzle_like.updated_at DESC")
	// GroupBy
	builder = builder.GroupBy("puzzle.id", "user.id", "puzzle_like.updated_at")

	nodes, err := p.listQuery(ctx, builder)
	if err != nil {
		return nil, err
	}

	return nodes, nil
}

func (p *puzzle) GetMostLiked(ctx context.Context, params entities.Pagination) ([]entities.PuzzleNode, error) {
	// TODO: Update this when more users join
	var likesLimit uint16 = 1
	builder := p.listBuilder(ctx, params, entities.PuzzleFilters{
		NumOfLikes: &likesLimit,
	})
	// OrderBy
	builder = builder.OrderBy("num_of_likes DESC")

	entities, err := p.listQuery(ctx, builder)
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (p *puzzle) GetMostPlayed(ctx context.Context, params entities.Pagination) ([]entities.PuzzleNode, error) {
	builder := p.listBuilder(ctx, params, entities.PuzzleFilters{})
	// Select
	builder = builder.Column("COUNT(game.id) AS num_of_games")
	// Join Game
	builder = builder.LeftJoin(fmt.Sprintf("%s game ON game.puzzle_id = puzzle.id AND game.completed_at IS NOT NULL", GameTable))
	// Having
	// TODO: Update this when more users join
	builder = builder.Having("num_of_games >= 1")
	// OrderBy
	builder = builder.OrderBy("num_of_games DESC")

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
		var numOfGamesModel uint
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
			&numOfGamesModel,
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

func (p *puzzle) GetRecent(ctx context.Context, params entities.Pagination, filters entities.PuzzleFilters) ([]entities.PuzzleNode, error) {
	cursor, err := params.Cursor.Decode()
	if err != nil {
		return nil, err
	}

	sortKey := params.SortKey
	sortOrder := params.SortOrder

	builder := p.listBuilder(ctx, params, filters)
	// Where
	where := squirrel.And{}
	if cursor != "" {
		var condition squirrel.Sqlizer = squirrel.LtOrEq{
			fmt.Sprintf("puzzle.%s", sortKey): cursor,
		}
		if sortOrder == "ASC" {
			condition = squirrel.GtOrEq{
				fmt.Sprintf("puzzle.%s", sortKey): cursor,
			}
		}
		where = append(where, condition)
	}
	builder = builder.Where(where)
	// OrderBy
	builder = builder.OrderBy(fmt.Sprintf("puzzle.%s %s", sortKey, sortOrder))

	nodes, err := p.listQuery(ctx, builder)
	if err != nil {
		return nil, err
	}

	return nodes, nil
}

func (p *puzzle) Search(ctx context.Context, params entities.Pagination, search string) ([]entities.PuzzleNode, error) {
	builder := p.listBuilder(ctx, params, entities.PuzzleFilters{})
	// Where
	builder = builder.Where("MATCH (puzzle.name, puzzle.description) AGAINST (? IN BOOLEAN MODE)", fmt.Sprintf("*'%s'*", search))

	nodes, err := p.listQuery(ctx, builder)
	if err != nil {
		return nil, err
	}

	return nodes, nil
}

func (p *puzzle) Update(ctx context.Context, updatePuzzle entities.Puzzle) (*entities.Puzzle, error) {
	puzzleModel := dtos.Puzzle().ToModel(updatePuzzle)
	puzzleModel.RefreshUpdated()

	puzzleQuery, puzzleArgs, err := squirrel.
		Update(PuzzleTable).
		Where("id = ? AND deleted_at IS NULL", puzzleModel.ID).
		SetMap(map[string]interface{}{
			"name":        puzzleModel.Name,
			"difficulty":  puzzleModel.Difficulty,
			"description": puzzleModel.Description,
			"updated_at":  puzzleModel.UpdatedAt,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	var groupModel []models.PuzzleGroup
	for _, group := range updatePuzzle.Groups {
		groupModel = append(groupModel, dtos.PuzzleGroup().ToModel(group))
	}

	groupBuilder := squirrel.Insert(PuzzleGroupTable).Columns("id", "description", "puzzle_id")
	for _, group := range groupModel {
		groupBuilder = groupBuilder.Values(
			group.ID,
			group.Description,
			group.PuzzleID,
		)
	}
	groupQuery, groupArgs, err := groupBuilder.
		Suffix("ON DUPLICATE KEY UPDATE description=VALUES(`description`)").
		ToSql()
	if err != nil {
		return nil, err
	}

	tx, err := p.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, puzzleQuery, puzzleArgs...); err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, groupQuery, groupArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return nil, err
	}

	updatePuzzle.UpdatedAt = puzzleModel.UpdatedAt

	return &updatePuzzle, nil
}

func (p *puzzle) Delete(ctx context.Context, id uuid.UUID) error {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return ErrUserNotFound
	}

	query, args, err := squirrel.
		Update(PuzzleTable).
		Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, user.ID).
		SetMap(map[string]interface{}{"deleted_at": time.Now()}).
		ToSql()
	if err != nil {
		return err
	}

	if _, err := p.db.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	return nil
}

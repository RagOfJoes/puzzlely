package mysql

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/puzzle/usecase"
	userMySQL "github.com/RagOfJoes/puzzlely/user/repository/mysql"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type mysqlDB struct {
	db *sqlx.DB
}

func New(db *sqlx.DB) usecase.Repository {
	logrus.Info("Created Puzzle MySQL Repository")
	return &mysqlDB{
		db: db,
	}
}

func (m *mysqlDB) Create(ctx context.Context, newPuzzle puzzle.Puzzle) (*puzzle.Puzzle, error) {
	model := fromEntity(newPuzzle)

	var blocksModel []Block
	var groupsModel []Group
	var answersModel []GroupAnswer
	for _, group := range newPuzzle.Groups {
		groupsModel = append(groupsModel, fromGroupEntity(group, model.ID))
		for _, block := range group.Blocks {
			blocksModel = append(blocksModel, fromBlockEntity(block, group.ID))
		}
		for _, answer := range group.Answers {
			answerID := uuid.New()
			answersModel = append(answersModel, GroupAnswer{
				ID:            answerID,
				Answer:        answer,
				PuzzleGroupID: group.ID,
			})
		}
	}

	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	puzzleQuery, puzzleArgs, err := squirrel.Insert(ms.PuzzlesTable).SetMap(map[string]interface{}{
		"id":           model.ID,
		"name":         model.Name,
		"description":  model.Description,
		"difficulty":   model.Difficulty,
		"max_attempts": model.MaxAttempts,
		"time_allowed": model.TimeAllowed,
		"created_at":   model.CreatedAt,
		"user_id":      model.UserID,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, puzzleQuery, puzzleArgs...); err != nil {
		return nil, err
	}

	groupsBuilder := squirrel.Insert(ms.PuzzleGroupsTable).Columns("id", "description", "puzzle_id")
	for _, group := range groupsModel {
		groupsBuilder = groupsBuilder.Values(group.ID, group.Description, model.ID)
	}
	groupsQuery, groupsArgs, err := groupsBuilder.ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, groupsQuery, groupsArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	answersBuilder := squirrel.Insert(ms.PuzzleGroupAnswersTable).Columns("id", "answer", "puzzle_group_id")
	for _, answer := range answersModel {
		answersBuilder = answersBuilder.Values(answer.ID, answer.Answer, answer.PuzzleGroupID)
	}
	answersQuery, answerArgs, err := answersBuilder.ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, answersQuery, answerArgs...); err != nil {
		return nil, err
	}

	blocksBuilder := squirrel.Insert(ms.PuzzleBlocksTable).Columns("id", "value", "puzzle_group_id")
	for _, block := range blocksModel {
		blocksBuilder = blocksBuilder.Values(block.ID, block.Value, block.GroupID)
	}
	blocksQuery, blocksArgs, err := blocksBuilder.ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, blocksQuery, blocksArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Transform models to entities
	entity := model.ToEntity()
	entity.Groups = newPuzzle.Groups

	return &entity, nil
}

func (m *mysqlDB) Get(ctx context.Context, value string, currentUser *uuid.UUID) (*puzzle.Puzzle, error) {
	baseQuery := squirrel.Select(
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
	).From(fmt.Sprintf("%s puzzle", ms.PuzzlesTable))
	// Join PuzzleGroups
	baseQuery = baseQuery.LeftJoin(fmt.Sprintf("%s puzzle_group ON puzzle_group.puzzle_id = puzzle.id", ms.PuzzleGroupsTable))
	// Join PuzzleGroupAnswers
	baseQuery = baseQuery.LeftJoin(fmt.Sprintf("%s puzzle_group_answer ON puzzle_group_answer.puzzle_group_id = puzzle_group.id", ms.PuzzleGroupAnswersTable))
	// Join PuzzleBlocks
	baseQuery = baseQuery.LeftJoin(fmt.Sprintf("%s puzzle_block ON puzzle_block.puzzle_group_id = puzzle_group.id", ms.PuzzleBlocksTable))
	// Join PuzzleLikes
	baseQuery = baseQuery.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = puzzle.id AND puzzle_like.active = true", ms.PuzzleLikesTable))
	// Join User
	baseQuery = baseQuery.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", ms.UsersTable))
	// Where and Transform
	query, args, err := baseQuery.Where("puzzle.id = ? AND puzzle.deleted_at IS NULL AND user.deleted_at IS NULL", value).
		GroupBy(
			"puzzle.id",
			"puzzle_group.id",
			"puzzle_group_answer.id",
			"puzzle_block.id",
			"user.id",
		).ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var model Puzzle
	var numOfLikes uint
	var createdBy userMySQL.User
	uuidMap := map[uuid.UUID]bool{}
	blocksMap := map[uuid.UUID][]Block{}
	groupsMap := map[uuid.UUID]Group{}
	answersMap := map[uuid.UUID][]GroupAnswer{}
	for rows.Next() {
		var answerModel GroupAnswer
		var blockModel Block
		var groupModel Group

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
			&groupModel.ID,
			&groupModel.Description,
			&groupModel.PuzzleID,
			&answerModel.ID,
			&answerModel.Answer,
			&answerModel.PuzzleGroupID,
			&blockModel.ID,
			&blockModel.Value,
			&blockModel.GroupID,
			&createdBy.ID,
			&createdBy.State,
			&createdBy.Username,
			&createdBy.CreatedAt,
			&createdBy.UpdatedAt,
			&numOfLikes,
		); err != nil {
			return nil, err
		}

		if _, ok := uuidMap[blockModel.ID]; !ok {
			uuidMap[blockModel.ID] = true
			blocksMap[groupModel.ID] = append(blocksMap[groupModel.ID], blockModel)
		}
		if _, ok := uuidMap[answerModel.ID]; !ok {
			uuidMap[answerModel.ID] = true
			answersMap[groupModel.ID] = append(answersMap[groupModel.ID], answerModel)
		}
		if _, ok := groupsMap[groupModel.ID]; !ok {
			groupsMap[groupModel.ID] = groupModel
		}
	}

	if model.ID == uuid.Nil {
		return nil, errors.New("puzzle not found")
	}

	likedAt, err := LikedAt(m.db, model.ID, currentUser)
	if err != nil {
		return nil, err
	}

	entity := model.ToEntity()
	entity.LikedAt = likedAt
	entity.NumOfLikes = numOfLikes
	entity.CreatedBy = createdBy.ToEntity()
	for _, group := range groupsMap {
		groupEntity := group.ToEntity()
		for _, answer := range answersMap[group.ID] {
			groupEntity.Answers = append(groupEntity.Answers, answer.Answer)
		}
		for _, block := range blocksMap[group.ID] {
			groupEntity.Blocks = append(groupEntity.Blocks, block.ToEntity())
		}
		entity.Groups = append(entity.Groups, groupEntity)
	}

	return &entity, nil
}

func (m *mysqlDB) GetCreated(ctx context.Context, params pagination.Params, userID uuid.UUID, currentUser *uuid.UUID) ([]*puzzle.Node, error) {
	cursor := params.Cursor
	sortKey := params.SortKey
	sortOrder := params.SortOrder

	builder := m.listBuilder(ctx, params, puzzle.Filters{})
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

	entities, err := m.listQuery(ctx, builder, currentUser)
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (m *mysqlDB) GetLiked(ctx context.Context, params pagination.Params, currentUser uuid.UUID) ([]*puzzle.Node, error) {
	cursor := params.Cursor

	builder := m.listBuilder(ctx, params, puzzle.Filters{})
	// Join Like
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = puzzle.id AND puzzle_like.active = true", ms.PuzzleLikesTable))
	// Where
	where := squirrel.And{
		squirrel.Eq{
			"puzzle_like.active":  true,
			"puzzle_like.user_id": currentUser,
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

	entities, err := m.listQuery(ctx, builder, &currentUser)
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (m *mysqlDB) GetMostLiked(ctx context.Context, params pagination.Params, currentUser *uuid.UUID) ([]*puzzle.Node, error) {
	// TODO: Update this when more users join
	var likesLimit uint16 = 1
	builder := m.listBuilder(ctx, params, puzzle.Filters{
		NumOfLikes: &likesLimit,
	})
	// OrderBy
	builder = builder.OrderBy("num_of_likes DESC")

	entities, err := m.listQuery(ctx, builder, currentUser)
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (m *mysqlDB) GetMostPlayed(ctx context.Context, params pagination.Params, currentUser *uuid.UUID) ([]*puzzle.Node, error) {
	builder := m.listBuilder(ctx, params, puzzle.Filters{})
	// Select
	builder = builder.Column("COUNT(game.id) AS num_of_games")
	// Join Game
	builder = builder.LeftJoin(fmt.Sprintf("%s game ON game.puzzle_id = puzzle.id AND game.completed_at IS NOT NULL", ms.GamesTable))
	// Having
	// TODO: Update this when more users join
	builder = builder.Having("num_of_games >= 1")
	// OrderBy
	builder = builder.OrderBy("num_of_games DESC")

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
		var numOfGamesModel uint
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
			&numOfGamesModel,
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

func (m *mysqlDB) GetRecent(ctx context.Context, params pagination.Params, filters puzzle.Filters, currentUser *uuid.UUID) ([]*puzzle.Node, error) {
	cursor := params.Cursor
	sortKey := params.SortKey
	sortOrder := params.SortOrder

	builder := m.listBuilder(ctx, params, filters)
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
	// // OrderBy
	builder = builder.OrderBy(fmt.Sprintf("puzzle.%s %s", sortKey, sortOrder))

	entities, err := m.listQuery(ctx, builder, currentUser)
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (m *mysqlDB) Search(ctx context.Context, params pagination.Params, search string, currentUser *uuid.UUID) ([]*puzzle.Node, error) {
	builder := m.listBuilder(ctx, params, puzzle.Filters{})
	builder = builder.Where("MATCH (puzzle.name, puzzle.description) AGAINST (? IN BOOLEAN MODE)", fmt.Sprintf("*'%s'*", search))

	entities, err := m.listQuery(ctx, builder, currentUser)
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (m *mysqlDB) ToggleLike(ctx context.Context, id uuid.UUID, currentUser uuid.UUID) (*puzzle.Like, error) {
	now := time.Now()

	existQuery, existArgs, err := squirrel.Select(
		"id",
		"active",
		"created_at",
		"updated_at",
	).From(ms.PuzzleLikesTable).Where("puzzle_id = ? AND user_id = ?", id, currentUser).ToSql()
	if err != nil {
		return nil, err
	}

	existRow := m.db.QueryRowContext(ctx, existQuery, existArgs...)

	var model Like
	switch err := existRow.Scan(&model.ID, &model.Active, &model.CreatedAt, &model.UpdatedAt); err {
	case nil:
		updateQuery, updateArgs, err := squirrel.Update(ms.PuzzleLikesTable).Where("puzzle_id = ? AND user_id = ?", id, currentUser).SetMap(map[string]interface{}{
			"active":     !model.Active,
			"updated_at": now,
		}).ToSql()
		if err != nil {
			return nil, err
		}

		if _, err := m.db.ExecContext(ctx, updateQuery, updateArgs...); err != nil {
			return nil, err
		}

		entity := model.ToEntity()
		entity.Active = !model.Active
		entity.UpdatedAt = &now

		return &entity, nil
	case sql.ErrNoRows:
		newID := uuid.New()
		createQuery, createArgs, err := squirrel.Insert(ms.PuzzleLikesTable).SetMap(map[string]interface{}{
			"id":         newID,
			"active":     true,
			"created_at": now,
			"updated_at": &now,
			"puzzle_id":  id,
			"user_id":    currentUser,
		}).ToSql()
		if err != nil {
			return nil, err
		}

		if _, err := m.db.ExecContext(ctx, createQuery, createArgs...); err != nil {
			return nil, err
		}

		newEntity := puzzle.Like{
			ID:        newID,
			Active:    true,
			CreatedAt: now,
			UpdatedAt: &now,
		}

		return &newEntity, nil
	default:
		return nil, err
	}
}

func (m *mysqlDB) Update(ctx context.Context, update puzzle.Puzzle) (*puzzle.Puzzle, error) {
	model := fromEntity(update)

	var groupsModel []Group
	for _, group := range update.Groups {
		groupsModel = append(groupsModel, fromGroupEntity(group, model.ID))
	}

	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	query, args, err := squirrel.Update(ms.PuzzlesTable).Where("id = ? AND deleted_at IS NULL", model.ID).SetMap(map[string]interface{}{
		"name":        model.Name,
		"difficulty":  model.Difficulty,
		"description": model.Description,
		"updated_at":  model.UpdatedAt,
	}).ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, query, args...); err != nil {
		tx.Rollback()
		return nil, err
	}

	groupsBuilder := squirrel.Insert(ms.PuzzleGroupsTable).Columns("id", "description", "puzzle_id")
	for _, groupModel := range groupsModel {
		groupsBuilder = groupsBuilder.Values(
			groupModel.ID,
			groupModel.Description,
			groupModel.PuzzleID,
		)
	}
	groupsSuffix := "ON DUPLICATE KEY UPDATE description=VALUES(`description`)"
	groupsQuery, groupsArgs, err := groupsBuilder.Suffix(groupsSuffix).ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, groupsQuery, groupsArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return nil, err
	}

	entity := model.ToEntity()
	entity.NumOfLikes = update.NumOfLikes
	entity.LikedAt = update.LikedAt
	entity.Groups = update.Groups
	entity.CreatedBy = update.CreatedBy

	return &entity, nil
}

func (m *mysqlDB) Delete(ctx context.Context, id, currentUser uuid.UUID) error {
	query, args, err := squirrel.Update(ms.PuzzlesTable).
		Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, currentUser).
		SetMap(map[string]interface{}{
			"deleted_at": time.Now(),
		}).ToSql()
	if err != nil {
		return err
	}

	if _, err := m.db.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	return nil
}

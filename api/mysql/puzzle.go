package mysql

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
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
	puzzle := dtos.Puzzle().ToModel(newPuzzle)

	var groups []models.Group
	var answers []models.GroupAnswer
	var blocks []models.Block
	for _, group := range newPuzzle.Groups {
		groupModel := dtos.Group().ToModel(group)
		groupModel.PuzzleID = puzzle.ID

		groups = append(groups, groupModel)
		for _, block := range group.Blocks {
			blocks = append(blocks, dtos.Block().ToModel(block))
		}

		for _, answer := range group.Answers {
			answerID := uuid.New()
			answers = append(answers, models.GroupAnswer{
				Bare: models.Bare{
					ID: answerID,
				},

				Answer:        answer,
				PuzzleGroupID: group.ID,
			})
		}
	}

	tx, err := p.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	puzzleQuery, puzzleArgs, err := squirrel.Insert(puzzle.TableName()).SetMap(map[string]interface{}{
		"id":           puzzle.ID,
		"name":         puzzle.Name,
		"description":  puzzle.Description,
		"difficulty":   puzzle.Difficulty,
		"max_attempts": puzzle.MaxAttempts,
		"time_allowed": puzzle.TimeAllowed,
		"created_at":   puzzle.CreatedAt,
		"user_id":      puzzle.UserID,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, puzzleQuery, puzzleArgs...); err != nil {
		return nil, err
	}

	groupInsert := squirrel.Insert(new(models.Group).TableName()).Columns("id", "description", "puzzle_id")
	for _, group := range groups {
		groupInsert = groupInsert.Values(group.ID, group.Description, puzzle.ID)
	}
	groupQuery, groupArgs, err := groupInsert.ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, groupQuery, groupArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	answerInsert := squirrel.Insert(new(models.GroupAnswer).TableName()).Columns("id", "answer", "puzzle_group_id")
	for _, answer := range answers {
		answerInsert = answerInsert.Values(answer.ID, answer.Answer, answer.PuzzleGroupID)
	}
	answerQuery, answerArgs, err := answerInsert.ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, answerQuery, answerArgs...); err != nil {
		return nil, err
	}

	blockInsert := squirrel.Insert(new(models.Block).TableName()).Columns("id", "value", "puzzle_group_id")
	for _, block := range blocks {
		blockInsert = blockInsert.Values(block.ID, block.Value, block.GroupID)
	}
	blockQuery, blockArgs, err := blockInsert.ToSql()
	if err != nil {
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
	var puzzleModel models.Puzzle
	var userModel models.User

	var numOfLikes uint
	uuidMap := map[uuid.UUID]bool{}
	groupsMap := map[uuid.UUID]models.Group{}
	answersMap := map[uuid.UUID][]models.GroupAnswer{}
	blocksMap := map[uuid.UUID][]models.Block{}

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
	).From(fmt.Sprintf("%s puzzle", puzzleModel.TableName()))
	// Join PuzzleGroups
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_group ON puzzle_group.puzzle_id = puzzle.id", new(models.Group).TableName()))
	// Join PuzzleGroupAnswers
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_group_answer ON puzzle_group_answer.puzzle_group_id = puzzle_group.id", new(models.GroupAnswer).TableName()))
	// Join PuzzleBlocks
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_block ON puzzle_block.puzzle_group_id = puzzle_group.id", new(models.Block).TableName()))
	// Join PuzzleLikes
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = puzzle.id AND puzzle_like.active = true", new(models.Like).TableName()))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", userModel.TableName()))
	// Where and Transform
	query, args, err := builder.Where("puzzle.id = ? AND puzzle.deleted_at IS NULL AND user.deleted_at IS NULL", id).
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

	rows, err := p.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var groupModel models.Group
		var groupAnswerModel models.GroupAnswer
		var blockModel models.Block

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
			blocksMap[groupModel.ID] = append(blocksMap[groupModel.ID], blockModel)
		}
		if _, ok := uuidMap[groupAnswerModel.ID]; !ok {
			uuidMap[groupAnswerModel.ID] = true
			answersMap[groupModel.ID] = append(answersMap[groupModel.ID], groupAnswerModel)
		}
		if _, ok := groupsMap[groupModel.ID]; !ok {
			groupsMap[groupModel.ID] = groupModel
		}
	}

	if puzzleModel.ID == uuid.Nil {
		return nil, errors.New("puzzle not found")
	}

	user := entities.UserFromContext(ctx)
	if user == nil {
		user = &entities.User{}
	}

	likedAtMap, err := LikedAt(p.db, []uuid.UUID{puzzleModel.ID}, user.ID)
	if err != nil {
		return nil, err
	}

	puzzle := dtos.Puzzle().ToEntity(puzzleModel)
	puzzle.LikedAt = likedAtMap[puzzleModel.ID]
	puzzle.NumOfLikes = numOfLikes
	puzzle.CreatedBy = dtos.User().ToEntity(userModel)
	for _, group := range groupsMap {
		g := dtos.Group().ToEntity(group)
		for _, answer := range answersMap[group.ID] {
			g.Answers = append(g.Answers, answer.Answer)
		}
		for _, block := range blocksMap[group.ID] {
			g.Blocks = append(g.Blocks, dtos.Block().ToEntity(block))
		}

		puzzle.Groups = append(puzzle.Groups, g)
	}

	return &puzzle, nil
}

func (p *puzzle) GetCreated(ctx context.Context, params pagination.Params, userID uuid.UUID) ([]entities.PuzzleNode, error) {
	cursor := params.Cursor
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

func (p *puzzle) GetLiked(ctx context.Context, params pagination.Params) ([]entities.PuzzleNode, error) {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return nil, errors.New("user not found in context")
	}

	cursor := params.Cursor

	builder := p.listBuilder(ctx, params, entities.PuzzleFilters{})
	// Join Like
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = puzzle.id AND puzzle_like.active = true", new(models.Like).TableName()))
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

func (p *puzzle) GetMostLiked(ctx context.Context, params pagination.Params) ([]entities.PuzzleNode, error) {
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

// TODO: Implemented this when Games has been refactored
func (p *puzzle) GetMostPlayed(ctx context.Context, params pagination.Params) ([]entities.PuzzleNode, error) {
	panic("not implemented")
}

func (p *puzzle) GetRecent(ctx context.Context, params pagination.Params, filters entities.PuzzleFilters) ([]entities.PuzzleNode, error) {
	cursor := params.Cursor
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
	// // OrderBy
	builder = builder.OrderBy(fmt.Sprintf("puzzle.%s %s", sortKey, sortOrder))

	nodes, err := p.listQuery(ctx, builder)
	if err != nil {
		return nil, err
	}

	return nodes, nil
}

func (p *puzzle) Search(ctx context.Context, params pagination.Params, search string) ([]entities.PuzzleNode, error) {
	builder := p.listBuilder(ctx, params, entities.PuzzleFilters{})
	builder = builder.Where("MATCH (puzzle.name, puzzle.description) AGAINST (? IN BOOLEAN MODE)", fmt.Sprintf("*'%s'*", search))

	nodes, err := p.listQuery(ctx, builder)
	if err != nil {
		return nil, err
	}

	return nodes, nil
}

func (p *puzzle) ToggleLike(ctx context.Context, id uuid.UUID) (*entities.Like, error) {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return nil, ErrUserNotFound
	}

	now := time.Now()

	var model models.Like

	existQuery, existArgs, err := squirrel.Select(
		"id",
		"active",
		"created_at",
		"updated_at",
	).From(model.TableName()).Where("puzzle_id = ? AND user_id = ?", id, user.ID).ToSql()
	if err != nil {
		return nil, err
	}

	existRow := p.db.QueryRowContext(ctx, existQuery, existArgs...)

	switch err := existRow.Scan(&model.ID, &model.Active, &model.CreatedAt, &model.UpdatedAt); err {
	case nil:
		updateQuery, updateArgs, err := squirrel.Update(model.TableName()).Where("puzzle_id = ? AND user_id = ?", id, user.ID).SetMap(map[string]interface{}{
			"active":     !model.Active,
			"updated_at": now,
		}).ToSql()
		if err != nil {
			return nil, err
		}

		if _, err := p.db.ExecContext(ctx, updateQuery, updateArgs...); err != nil {
			return nil, err
		}

		entity := dtos.Like().ToEntity(model)
		entity.Active = !model.Active
		entity.UpdatedAt = now

		return &entity, nil
	case sql.ErrNoRows:
		newID := uuid.New()
		createQuery, createArgs, err := squirrel.Insert(model.TableName()).SetMap(map[string]interface{}{
			"id":         newID,
			"active":     true,
			"created_at": now,
			"updated_at": now,
			"puzzle_id":  id,
			"user_id":    user.ID,
		}).ToSql()
		if err != nil {
			return nil, err
		}

		if _, err := p.db.ExecContext(ctx, createQuery, createArgs...); err != nil {
			return nil, err
		}

		newEntity := entities.Like{
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

func (p *puzzle) Update(ctx context.Context, updatePuzzle entities.Puzzle) (*entities.Puzzle, error) {
	puzzleModel := dtos.Puzzle().ToModel(updatePuzzle)

	var groupModel []models.Group
	for _, group := range updatePuzzle.Groups {
		groupModel = append(groupModel, dtos.Group().ToModel(group))
	}

	tx, err := p.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	puzzleQuery, puzzleArgs, err := squirrel.Update(puzzleModel.TableName()).
		Where("id = ? AND deleted_at IS NULL", puzzleModel.ID).
		SetMap(map[string]interface{}{
			"name":        puzzleModel.Name,
			"difficulty":  puzzleModel.Difficulty,
			"description": puzzleModel.Description,
			"updated_at":  puzzleModel.UpdatedAt,
		}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, puzzleQuery, puzzleArgs...); err != nil {
		return nil, err
	}

	groupBuilder := squirrel.Insert(new(models.Group).TableName()).Columns("id", "description", "puzzle_id")
	for _, group := range groupModel {
		groupBuilder = groupBuilder.Values(
			group.ID,
			group.Description,
			group.PuzzleID,
		)
	}

	groupQuery, groupArgs, err := groupBuilder.
		Suffix("ON DUPLICATE KEY UPDATE description=VALUES(`description`)").ToSql()
	if err != nil {
		tx.Rollback()
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

	return &updatePuzzle, nil
}

func (p *puzzle) Delete(ctx context.Context, id uuid.UUID) error {
	user := entities.UserFromContext(ctx)
	if user == nil {
		return ErrUserNotFound
	}

	query, args, err := squirrel.Update(new(models.Puzzle).TableName()).
		Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, user.ID).
		SetMap(map[string]interface{}{
			"deleted_at": time.Now(),
		}).ToSql()
	if err != nil {
		return err
	}

	if _, err := p.db.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	return nil
}

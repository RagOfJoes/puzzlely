package mysql

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	"github.com/RagOfJoes/puzzlely/puzzle"
	puzzleMySQL "github.com/RagOfJoes/puzzlely/puzzle/repository/mysql"
	userMySQL "github.com/RagOfJoes/puzzlely/user/repository/mysql"
	"github.com/google/uuid"
)

func (m *mysqlDB) puzzle(ctx context.Context, game Game, currentUser *uuid.UUID) (*puzzle.Puzzle, error) {
	// Select Puzzles and PuzzleLikes
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
	baseQuery = baseQuery.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.active = ? AND puzzle_like.puzzle_id = puzzle.id", ms.PuzzleLikesTable), true)
	// Join User
	baseQuery = baseQuery.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", ms.UsersTable))
	// Where and Transform
	query, args, err := baseQuery.Where("puzzle.id = ? AND puzzle.deleted_at IS NULL", game.PuzzleID).
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

	var model puzzleMySQL.Puzzle
	var numOfLikes uint
	var createdBy userMySQL.User
	uuidMap := map[uuid.UUID]bool{}
	blocksMap := map[uuid.UUID][]puzzleMySQL.Block{}
	groupsMap := map[uuid.UUID]puzzleMySQL.Group{}
	answersMap := map[uuid.UUID][]puzzleMySQL.GroupAnswer{}
	for rows.Next() {
		var answerModel puzzleMySQL.GroupAnswer
		var blockModel puzzleMySQL.Block
		var groupModel puzzleMySQL.Group

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

	likedAt, err := puzzleMySQL.LikedAt(m.db, model.ID, currentUser)
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

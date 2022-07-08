package mysql

import (
	"context"
	"database/sql"
	"fmt"
	"sort"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/game"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	"github.com/RagOfJoes/puzzlely/user"
	userMySQL "github.com/RagOfJoes/puzzlely/user/repository/mysql"
	"github.com/google/uuid"
)

func (m *mysqlDB) attempts(ctx context.Context, game Game) ([][]uuid.UUID, error) {
	query, args, err := squirrel.Select("attempt.order", "attempt.puzzle_block_id").From(fmt.Sprintf("%s attempt", ms.GameAttempts)).Where("attempt.game_id = ?", game.ID).ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	models := map[uint16][]uuid.UUID{}
	for rows.Next() {
		var model Attempt
		if err := rows.Scan(
			&model.Order,
			&model.PuzzleBlockID,
		); err != nil {
			return nil, err
		}

		order := uint16(model.Order.Int16)
		models[order] = append(models[order], model.PuzzleBlockID)
	}

	keys := []int{}
	for key := range models {
		keys = append(keys, int(key))
	}
	sort.Ints(keys)

	attempts := [][]uuid.UUID{}
	for _, value := range keys {
		attempts = append(attempts, models[uint16(value)])
	}

	return attempts, nil
}

func (m *mysqlDB) challengedBy(ctx context.Context, game Game) (*game.Node, error) {
	if game.ChallengedBy == nil {
		return nil, nil
	}

	builder := squirrel.Select(
		"game.id",
		"game.score",
		"game.challenge_code",
		"game.created_at",
		"game.started_at",
		"game.guessed_at",
		"game.completed_at",
		"game.challenged_by",
		"user.id",
		"user.state",
		"user.username",
		"user.created_at",
		"user.updated_at",
		"COUNT(DISTINCT(game_attempt.order))",
	).From(fmt.Sprintf("%s game", ms.GamesTable))
	// Join Game Attempts
	builder = builder.LeftJoin(fmt.Sprintf("%s game_attempt ON game_attempt.game_id = game.id", ms.GameAttempts))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = game.user_id", ms.UsersTable))

	query, args, err := builder.Where("game.id = ? AND user.deleted_at IS NULL", game.ChallengedBy).GroupBy("game.id", "user.id").ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var model Game
	var numOfAttempts uint
	var usersModel userMySQL.User
	var usersState sql.NullString
	var usersUsername sql.NullString
	var usersCreatedAt sql.NullTime
	for rows.Next() {
		if err := rows.Scan(
			&model.ID,
			&model.Score,
			&model.ChallengeCode,
			&model.CreatedAt,
			&model.StartedAt,
			&model.GuessedAt,
			&model.CompletedAt,
			&model.ChallengedBy,
			&usersModel.ID,
			&usersState,
			&usersUsername,
			&usersCreatedAt,
			&usersModel.UpdatedAt,
			&numOfAttempts,
		); err != nil {
			return nil, err
		}
	}

	entity := model.ToNodeEntity()
	entity.Attempts = uint8(numOfAttempts)
	if model.UserID != nil && *model.UserID != uuid.Nil {
		usersModel.State = usersState.String
		usersModel.Username = usersUsername.String
		usersModel.CreatedAt = usersCreatedAt.Time
		user := usersModel.ToEntity()
		entity.User = &user
	}

	return &entity, nil
}

func query(column, value string) (*squirrel.SelectBuilder, error) {
	query := squirrel.Select(
		"game.id",
		"game.score",
		"game.challenge_code",
		"game.created_at",
		"game.started_at",
		"game.guessed_at",
		"game.completed_at",
		"game.challenged_by",
		"game.puzzle_id",
		"game.user_id",
		"game_config.id",
		"game_config.max_attempts",
		"game_config.time_allowed",
		"game_correct.id",
		"game_correct.puzzle_group_id",
		"game_result.id",
		"game_result.guess",
		"game_result.correct",
		"game_result.puzzle_group_id",
		"user.id",
		"user.state",
		"user.username",
		"user.created_at",
		"user.updated_at",
	).From(fmt.Sprintf("%s game", ms.GamesTable))
	// Join Game Configs
	query = query.LeftJoin(fmt.Sprintf("%s game_config ON game_config.game_id = game.id", ms.GameConfigs))
	// Join Game Corrects
	query = query.LeftJoin(fmt.Sprintf("%s game_correct ON game_correct.game_id = game.id", ms.GameCorrects))
	// Join Game Results
	query = query.LeftJoin(fmt.Sprintf("%s game_result ON game_result.game_id = game.id", ms.GameResults))
	// Join Users
	query = query.LeftJoin(fmt.Sprintf("%s user ON user.id = game.user_id", ms.UsersTable))

	query = query.Where(squirrel.And{
		squirrel.Eq{
			fmt.Sprintf("game.%s", column): value,
			"user.deleted_at":              nil,
		},
	}).GroupBy(
		"game.id",
		"game_config.id",
		"game_correct.id",
		"game_result.id",
		"user.id",
	)

	return &query, nil
}

func (m *mysqlDB) find(ctx context.Context, column, value string, currentUser *uuid.UUID) (*game.Game, error) {
	builder, err := query(column, value)
	if err != nil {
		return nil, err
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Game models
	var model Game
	var configsModel Config
	var correctsModels []Correct
	var resultsModels []Result
	var usersModel userMySQL.User
	var usersState sql.NullString
	var usersUsername sql.NullString
	var usersCreatedAt sql.NullTime
	// Misc.
	uuidMap := map[uuid.UUID]bool{}

	for rows.Next() {
		var correctModel Correct
		var resultModel Result
		if err := rows.Scan(
			&model.ID,
			&model.Score,
			&model.ChallengeCode,
			&model.CreatedAt,
			&model.StartedAt,
			&model.GuessedAt,
			&model.CompletedAt,
			&model.ChallengedBy,
			&model.PuzzleID,
			&model.UserID,
			&configsModel.ID,
			&configsModel.MaxAttempts,
			&configsModel.TimeAllowed,
			&correctModel.ID,
			&correctModel.PuzzleGroupID,
			&resultModel.ID,
			&resultModel.Guess,
			&resultModel.Correct,
			&resultModel.PuzzleGroupID,
			&usersModel.ID,
			&usersState,
			&usersUsername,
			&usersCreatedAt,
			&usersModel.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if _, ok := uuidMap[correctModel.ID]; correctModel.ID != uuid.Nil && !ok {
			uuidMap[correctModel.ID] = true
			correctsModels = append(correctsModels, correctModel)
		}
		if _, ok := uuidMap[resultModel.ID]; resultModel.ID != uuid.Nil && !ok {
			uuidMap[resultModel.ID] = true
			resultsModels = append(resultsModels, resultModel)
		}
	}

	attempts, err := m.attempts(ctx, model)
	if err != nil {
		return nil, err
	}

	puzzle, err := m.puzzle(ctx, model, currentUser)
	if err != nil {
		return nil, err
	}

	config := game.Config{
		MaxAttempts: uint16(configsModel.MaxAttempts.Int16),
		TimeAllowed: uint32(configsModel.TimeAllowed.Int32),
	}

	challengedBy, err := m.challengedBy(ctx, model)
	if err != nil {
		return nil, err
	}
	if challengedBy != nil {
		challengedBy.Config = config
		challengedBy.Puzzle = puzzle.Node()
	}

	corrects := []uuid.UUID{}
	for _, correct := range correctsModels {
		corrects = append(corrects, correct.PuzzleGroupID)
	}
	results := []game.Result{}
	for _, result := range resultsModels {
		results = append(results, result.toEntity())
	}

	var user *user.User
	if model.UserID != nil && *model.UserID != uuid.Nil {
		usersModel.State = usersState.String
		usersModel.Username = usersUsername.String
		usersModel.CreatedAt = usersCreatedAt.Time
		userEntity := usersModel.ToEntity()
		user = &userEntity
	}

	entity := model.ToEntity()
	entity.Config = config
	entity.Attempts = attempts
	entity.Correct = corrects
	entity.Results = results
	entity.ChallengedBy = challengedBy
	entity.Puzzle = *puzzle
	entity.User = user

	return &entity, nil
}

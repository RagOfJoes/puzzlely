package mysql

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/game"
	"github.com/RagOfJoes/puzzlely/game/usecase"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	puzzleMySQL "github.com/RagOfJoes/puzzlely/puzzle/repository/mysql"
	"github.com/RagOfJoes/puzzlely/user"
	userMySQL "github.com/RagOfJoes/puzzlely/user/repository/mysql"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type mysqlDB struct {
	db *sqlx.DB
}

func New(db *sqlx.DB) usecase.Repository {
	logrus.Info("Created Game MySQL Repository")
	return &mysqlDB{
		db: db,
	}
}

func (m *mysqlDB) Create(ctx context.Context, newGame game.Game) (*game.Game, error) {
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	model := fromEntity(newGame)
	gameQuery, gameArgs, err := squirrel.Insert(ms.GamesTable).SetMap(map[string]interface{}{
		"id":             model.ID,
		"challenge_code": model.ChallengeCode,
		"challenged_by":  model.ChallengedBy,
		"puzzle_id":      model.PuzzleID,
		"user_id":        model.UserID,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, gameQuery, gameArgs...); err != nil {
		return nil, err
	}

	configModel := Config{
		ID: uuid.New(),
		MaxAttempts: sql.NullInt16{
			Int16: int16(newGame.Config.MaxAttempts),
			Valid: true,
		},
		TimeAllowed: sql.NullInt32{
			Int32: int32(newGame.Config.TimeAllowed),
			Valid: true,
		},
		GameID: newGame.ID,
	}
	configQuery, configArgs, err := squirrel.Insert(ms.GameConfigs).SetMap(map[string]interface{}{
		"id":           configModel.ID,
		"max_attempts": configModel.MaxAttempts,
		"time_allowed": configModel.TimeAllowed,
		"game_id":      configModel.GameID,
	}).ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, configQuery, configArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return nil, err
	}

	entity := model.ToEntity()
	entity.Correct = nil
	entity.Attempts = nil
	entity.Config = newGame.Config
	entity.ChallengedBy = newGame.ChallengedBy
	entity.Puzzle = newGame.Puzzle
	entity.User = newGame.User

	return &entity, nil
}

func (m *mysqlDB) Get(ctx context.Context, id uuid.UUID, currentUser *uuid.UUID) (*game.Game, error) {
	return m.find(ctx, "id", id.String(), currentUser)
}

func (m *mysqlDB) GetPlayed(ctx context.Context, params pagination.Params, user user.User, currentUser *uuid.UUID) ([]*game.Node, error) {
	cursor := params.Cursor
	limit := params.Limit
	sortKey := params.SortKey
	sortOrder := params.SortOrder

	builder := squirrel.Select(
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
		"game_config.game_id",
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
		"COUNT(DISTINCT(game_attempt.order))",
		"COUNT(puzzle_like.id)",
	).From(fmt.Sprintf("%s game", ms.GamesTable))
	// Join Game Configs
	builder = builder.LeftJoin(fmt.Sprintf("%s game_config ON game_config.game_id = game.id", ms.GameConfigs))
	// Join Game Attempts
	builder = builder.LeftJoin(fmt.Sprintf("%s game_attempt ON game_attempt.game_id = game.id", ms.GameAttempts))
	// Join Puzzle
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle ON puzzle.id = game.puzzle_id", ms.PuzzlesTable))
	// Join Likes
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = game.puzzle_id AND active = true", ms.PuzzleLikesTable))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", ms.UsersTable))
	// Order
	builder = builder.OrderByClause(fmt.Sprintf("game.%s %s", sortKey, sortOrder))
	// Limit
	builder = builder.Limit(uint64(limit))
	// Where
	where := squirrel.And{
		squirrel.Eq{
			"game.user_id":      user.ID,
			"puzzle.deleted_at": nil,
			"user.deleted_at":   nil,
		},
		squirrel.NotEq{
			"game.completed_at": nil,
		},
	}
	if cursor != "" {
		if sortOrder == "ASC" {
			where = append(where, squirrel.GtOrEq{
				fmt.Sprintf("game.%s", sortKey): cursor,
			})
		} else {
			where = append(where, squirrel.LtOrEq{
				fmt.Sprintf("game.%s", sortKey): cursor,
			})
		}
	}
	query, args, err := builder.Where(where).GroupBy("game.id", "game_config.id", "puzzle.id", "user.id").ToSql()
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
	// This array is for finding whether a user has liked a list of puzzles
	puzzleIDs := []uuid.UUID{}

	models := map[uuid.UUID]Game{}
	uIntMap := map[uuid.UUID]uint{}
	configsMap := map[uuid.UUID]Config{}
	puzzlesMap := map[uuid.UUID]puzzleMySQL.Puzzle{}
	// User models
	var puzzleCreatedByModel userMySQL.User
	for rows.Next() {
		var model Game
		var numOfLikes uint
		var numOfAttempts uint
		var configModel Config
		var puzzleModel puzzleMySQL.Puzzle

		var userModel userMySQL.User
		var usernameModel sql.NullString
		var userStateModel sql.NullString
		var userCreatedAtModel sql.NullTime

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
			&configModel.ID,
			&configModel.MaxAttempts,
			&configModel.TimeAllowed,
			&configModel.GameID,
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
			&userStateModel,
			&usernameModel,
			&userCreatedAtModel,
			&userModel.UpdatedAt,
			&numOfAttempts,
			&numOfLikes,
		); err != nil {
			return nil, err
		}

		if _, ok := models[model.ID]; !ok {
			ids = append(ids, model.ID)
			models[model.ID] = model
		}
		if _, ok := configsMap[model.ID]; !ok {
			configsMap[model.ID] = configModel
		}
		if _, ok := uIntMap[model.ID]; !ok && model.ID != uuid.Nil {
			uIntMap[model.ID] = numOfAttempts
		}
		if _, ok := uIntMap[puzzleModel.ID]; !ok && puzzleModel.ID != uuid.Nil {
			uIntMap[puzzleModel.ID] = numOfLikes
		}
		if _, ok := puzzlesMap[model.PuzzleID]; !ok {
			puzzleIDs = append(puzzleIDs, model.PuzzleID)
			puzzlesMap[model.PuzzleID] = puzzleModel
		}
		if userModel.ID != uuid.Nil {
			puzzleCreatedByModel.ID = userModel.ID
			puzzleCreatedByModel.State = userStateModel.String
			puzzleCreatedByModel.Username = usernameModel.String
			puzzleCreatedByModel.CreatedAt = userCreatedAtModel.Time
			puzzleCreatedByModel.UpdatedAt = userModel.UpdatedAt
		}
	}

	likedAtMap, err := puzzleMySQL.LikedAtList(m.db, puzzleIDs, currentUser)
	if err != nil {
		return nil, err
	}

	var entities []*game.Node
	for _, id := range ids {
		model, ok := models[id]
		if !ok {
			continue
		}

		entity := model.ToNodeEntity()
		entity.User = &user
		if attempts, ok := uIntMap[model.ID]; ok {
			entity.Attempts = uint8(attempts)
		}
		if config, ok := configsMap[model.ID]; ok {
			entity.Config = game.Config{
				MaxAttempts: uint16(config.MaxAttempts.Int16),
				TimeAllowed: uint32(config.TimeAllowed.Int32),
			}
		}
		if puzzle, ok := puzzlesMap[model.PuzzleID]; ok {
			entity.Puzzle = puzzle.ToNodeEntity()
			entity.Puzzle.CreatedBy = puzzleCreatedByModel.ToEntity()
			if likes, ok := uIntMap[model.PuzzleID]; ok {
				entity.Puzzle.NumOfLikes = likes
			}
			if likedAt, ok := likedAtMap[model.PuzzleID]; ok {
				entity.Puzzle.LikedAt = likedAt
			}
		}

		entities = append(entities, &entity)
	}

	return entities, nil
}

func (m *mysqlDB) GetWithChallengeCode(ctx context.Context, challengeCode string, currentUser *uuid.UUID) (*game.Game, error) {
	return m.find(ctx, "challenge_code", challengeCode, currentUser)
}

func (m *mysqlDB) Update(ctx context.Context, updateGame game.Game) (*game.Game, error) {
	model := fromEntity(updateGame)
	configModel := Config{
		ID: uuid.New(),
		MaxAttempts: sql.NullInt16{
			Int16: int16(updateGame.Config.MaxAttempts),
			Valid: true,
		},
		TimeAllowed: sql.NullInt32{
			Int32: int32(updateGame.Config.TimeAllowed),
			Valid: true,
		},
		GameID: updateGame.ID,
	}
	var attemptsModels []Attempt
	for index := range updateGame.Attempts {
		order := sql.NullInt16{
			Int16: int16(index),
			Valid: true,
		}
		for _, attempt := range updateGame.Attempts[index] {
			attemptsModels = append(attemptsModels, Attempt{
				ID:            uuid.New(),
				Order:         order,
				PuzzleBlockID: attempt,
				GameID:        updateGame.ID,
			})
		}
	}
	var correctsModels []Correct
	for _, correct := range updateGame.Correct {
		correctsModels = append(correctsModels, Correct{
			ID:            uuid.New(),
			PuzzleGroupID: correct,
			GameID:        updateGame.ID,
		})
	}
	var resultsModels []Result
	for _, result := range updateGame.Results {
		resultsModels = append(resultsModels, Result{
			ID: uuid.New(),
			Guess: sql.NullString{
				String: result.Guess,
				Valid:  true,
			},
			Correct: sql.NullBool{
				Bool:  result.Correct,
				Valid: true,
			},
			PuzzleGroupID: result.PuzzleGroupID,
			GameID:        updateGame.ID,
		})
	}

	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	gameQuery, gameArgs, err := squirrel.Update(ms.GamesTable).Where("id = ?", model.ID).SetMap(map[string]interface{}{
		"score":        model.Score,
		"started_at":   model.StartedAt,
		"guessed_at":   model.GuessedAt,
		"completed_at": model.CompletedAt,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, gameQuery, gameArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	configSuffix := "ON DUPLICATE KEY UPDATE `max_attempts`=VALUES(`max_attempts`), `time_allowed`=VALUES(`time_allowed`)"
	configQuery, configArgs, err := squirrel.Insert(ms.GameConfigs).SetMap(map[string]interface{}{
		"id":           configModel.ID,
		"max_attempts": configModel.MaxAttempts,
		"time_allowed": configModel.TimeAllowed,
		"game_id":      configModel.GameID,
	}).Suffix(configSuffix).ToSql()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, configQuery, configArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	if len(attemptsModels) > 0 {
		attemptsBuilder := squirrel.Insert(ms.GameAttempts).Columns("`id`", "`order`", "`puzzle_block_id`", "`game_id`")
		for _, attemptModel := range attemptsModels {
			attemptsBuilder = attemptsBuilder.Values(
				attemptModel.ID,
				attemptModel.Order,
				attemptModel.PuzzleBlockID,
				attemptModel.GameID,
			)
		}

		attemptsSuffix := "ON DUPLICATE KEY UPDATE `order`=VALUES(`order`), `puzzle_block_id`=VALUES(`puzzle_block_id`)"
		attemptsQuery, attemptsArgs, err := attemptsBuilder.Suffix(attemptsSuffix).ToSql()
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, attemptsQuery, attemptsArgs...); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if len(correctsModels) > 0 {
		correctsBuilder := squirrel.Insert(ms.GameCorrects).Columns("`id`", "`puzzle_group_id`", "`game_id`")
		for _, correctModel := range correctsModels {
			correctsBuilder = correctsBuilder.Values(
				correctModel.ID,
				correctModel.PuzzleGroupID,
				correctModel.GameID,
			)
		}

		correctsSuffix := "ON DUPLICATE KEY UPDATE `puzzle_group_id`=VALUES(`puzzle_group_id`)"
		correctsQuery, correctsArgs, err := correctsBuilder.Suffix(correctsSuffix).ToSql()
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, correctsQuery, correctsArgs...); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if len(resultsModels) > 0 {
		resultsBuilder := squirrel.Insert(ms.GameResults).Columns("`id`", "`guess`", "`correct`", "`puzzle_group_id`", "`game_id`")
		for _, resultModel := range resultsModels {
			resultsBuilder = resultsBuilder.Values(
				resultModel.ID,
				resultModel.Guess,
				resultModel.Correct,
				resultModel.PuzzleGroupID,
				resultModel.GameID,
			)
		}

		resultsSuffix := "ON DUPLICATE KEY UPDATE `guess`=VALUES(`guess`), `correct`=VALUES(`correct`), `puzzle_group_id`=VALUES(`puzzle_group_id`)"
		resultsQuery, resultsArgs, err := resultsBuilder.Suffix(resultsSuffix).ToSql()
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, resultsQuery, resultsArgs...); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return nil, err
	}

	entity := updateGame
	return &entity, nil
}

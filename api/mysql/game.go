package mysql

import (
	"context"
	"database/sql"
	"fmt"

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

type game struct {
	db     *sqlx.DB
	puzzle repositories.Puzzle
}

func NewGame(db *sqlx.DB, puzzle repositories.Puzzle) repositories.Game {
	logrus.Info("Created Game MySQL Repository")

	return &game{
		db:     db,
		puzzle: puzzle,
	}
}

func (g *game) Create(ctx context.Context, newGame entities.Game) (*entities.Game, error) {
	gameModel := dtos.Game().ToModel(newGame)

	gameQuery, gameArgs, err := squirrel.
		Insert(GameTable).
		SetMap(map[string]interface{}{
			"id":             gameModel.ID,
			"challenge_code": gameModel.ChallengeCode,
			"challenged_by":  gameModel.ChallengedBy,
			"puzzle_id":      gameModel.PuzzleID,
			"user_id":        gameModel.UserID,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	configModel := dtos.GameConfig().ToModel(newGame.Config)
	configModel.GameID = newGame.ID

	configQuery, configArgs, err := squirrel.
		Insert(GameConfigTable).
		SetMap(map[string]interface{}{
			"id":           configModel.ID,
			"max_attempts": configModel.MaxAttempts,
			"time_allowed": configModel.TimeAllowed,
			"game_id":      configModel.GameID,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	tx, err := g.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, gameQuery, gameArgs...); err != nil {
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

	return &newGame, nil
}

func (g *game) Get(ctx context.Context, id uuid.UUID) (*entities.Game, error) {
	return g.find(ctx, "id", id.String())
}

// TODO: Bring this out into a general function similar to puzzle
func (g *game) GetPlayed(ctx context.Context, params pagination.Params, user entities.User) ([]entities.GameNode, error) {
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
	).From(fmt.Sprintf("%s game", GameTable))
	// Join Game Config
	builder = builder.LeftJoin(fmt.Sprintf("%s game_config ON game_config.game_id = game.id", GameConfigTable))
	// Join Game Attempt
	builder = builder.LeftJoin(fmt.Sprintf("%s game_attempt ON game_attempt.game_id = game.id", GameAttemptTable))
	// Join Puzzle
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle ON puzzle.id = game.puzzle_id", PuzzleTable))
	// Join Puzzle Like
	builder = builder.LeftJoin(fmt.Sprintf("%s puzzle_like ON puzzle_like.puzzle_id = game.puzzle_id AND active = true", PuzzleLikeTable))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id", UserTable))
	// Order
	builder = builder.OrderByClause(fmt.Sprintf("game.%s %s", sortKey, sortOrder))
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
	builder = builder.Where(where)
	// Limit
	builder = builder.Limit(uint64(limit))
	// GroupBy
	builder = builder.GroupBy("game.id", "game_config.id", "puzzle.id", "user.id")

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := g.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// This array helps maintain order of list
	ids := []uuid.UUID{}
	// This array is for finding whether a user has liked a list of puzzles
	puzzleIDs := []uuid.UUID{}

	gameModels := map[uuid.UUID]models.Game{}
	uIntMap := map[uuid.UUID]uint{}
	configMap := map[uuid.UUID]models.GameConfig{}
	puzzleMap := map[uuid.UUID]models.Puzzle{}
	var createdByModel models.User

	for rows.Next() {
		var gameModel models.Game
		var numOfLikes uint
		var numOfAttempts uint
		var configModel models.GameConfig
		var puzzleModel models.Puzzle

		var userModel models.User
		var usernameModel sql.NullString
		var userStateModel sql.NullString
		var userCreatedAtModel sql.NullTime

		if err := rows.Scan(
			&gameModel.ID,
			&gameModel.Score,
			&gameModel.ChallengeCode,
			&gameModel.CreatedAt,
			&gameModel.StartedAt,
			&gameModel.GuessedAt,
			&gameModel.CompletedAt,
			&gameModel.ChallengedBy,
			&gameModel.PuzzleID,
			&gameModel.UserID,
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

		if _, ok := gameModels[gameModel.ID]; !ok {
			ids = append(ids, gameModel.ID)
			gameModels[gameModel.ID] = gameModel
		}
		if _, ok := configMap[gameModel.ID]; !ok {
			configMap[gameModel.ID] = configModel
		}
		if _, ok := uIntMap[gameModel.ID]; !ok && gameModel.ID != uuid.Nil {
			uIntMap[gameModel.ID] = numOfAttempts
		}
		if _, ok := uIntMap[puzzleModel.ID]; !ok && puzzleModel.ID != uuid.Nil {
			uIntMap[puzzleModel.ID] = numOfLikes
		}
		if _, ok := puzzleMap[gameModel.PuzzleID]; !ok {
			puzzleIDs = append(puzzleIDs, gameModel.PuzzleID)
			puzzleMap[gameModel.PuzzleID] = puzzleModel
		}
		if userModel.ID != uuid.Nil {
			createdByModel.ID = userModel.ID
			createdByModel.State = userStateModel.String
			createdByModel.Username = usernameModel.String
			createdByModel.CreatedAt = userCreatedAtModel.Time
			createdByModel.UpdatedAt = userModel.UpdatedAt
		}
	}

	likedAtMap, err := g.puzzle.GetLikedAt(ctx, puzzleIDs)
	if err != nil {
		return nil, err
	}

	var nodes []entities.GameNode
	for _, id := range ids {
		gameModel, ok := gameModels[id]
		if !ok {
			continue
		}

		game := dtos.Game().ToNode(gameModel)
		game.User = &user

		if attempts, ok := uIntMap[gameModel.ID]; ok {
			game.Attempts = uint8(attempts)
		}
		if configModel, ok := configMap[gameModel.ID]; ok {
			game.Config = dtos.GameConfig().ToEntity(configModel)
		}
		if puzzle, ok := puzzleMap[gameModel.PuzzleID]; ok {
			game.Puzzle = dtos.Puzzle().ToNode(puzzle)
			game.Puzzle.CreatedBy = dtos.User().ToEntity(createdByModel)

			if numOfLikes, ok := uIntMap[gameModel.ID]; ok {
				game.Puzzle.NumOfLikes = numOfLikes
			}
			if likedAt, ok := likedAtMap[gameModel.PuzzleID]; ok {
				game.Puzzle.LikedAt = likedAt
			}
		}

		nodes = append(nodes, game)
	}

	return nodes, nil
}

func (g *game) GetWithChallengeCode(ctx context.Context, challengeCode string) (*entities.Game, error) {
	return g.find(ctx, "challenge_code", challengeCode)
}

func (g *game) Update(ctx context.Context, updateGame entities.Game) (*entities.Game, error) {
	// Create models from entity
	gameModel := dtos.Game().ToModel(updateGame)
	configModel := dtos.GameConfig().ToModel(updateGame.Config)
	configModel.GameID = updateGame.ID
	var attemptModels []models.GameAttempt
	for index := range updateGame.Attempts {
		for _, attempt := range updateGame.Attempts[index] {
			attemptModel := models.GameAttempt{
				Bare: models.Bare{
					ID: uuid.New(),
				},

				Order: sql.NullInt16{
					Int16: int16(index),
					Valid: true,
				},
				PuzzleBlockID: attempt,
				GameID:        updateGame.ID,
			}

			attemptModels = append(attemptModels, attemptModel)
		}
	}
	var correctModels []models.GameCorrect
	for _, correct := range updateGame.Correct {
		correctModel := models.GameCorrect{
			Bare: models.Bare{
				ID: uuid.New(),
			},

			PuzzleGroupID: correct,
			GameID:        updateGame.ID,
		}

		correctModels = append(correctModels, correctModel)
	}
	var resultModels []models.GameResult
	for _, result := range updateGame.Results {
		resultModel := dtos.GameResult().ToModel(result)
		resultModel.GameID = updateGame.ID

		resultModels = append(resultModels, resultModel)
	}

	gameQuery, gameArgs, err := squirrel.
		Update(GameTable).
		Where("id = ?", gameModel.ID).
		SetMap(map[string]interface{}{
			"score":        gameModel.Score,
			"started_at":   gameModel.StartedAt,
			"guessed_at":   gameModel.GuessedAt,
			"completed_at": gameModel.CompletedAt,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	configQuery, configArgs, err := squirrel.
		Insert(GameConfigTable).
		SetMap(map[string]interface{}{
			"id":           configModel.ID,
			"max_attempts": configModel.MaxAttempts,
			"time_allowed": configModel.TimeAllowed,
			"game_id":      configModel.GameID,
		}).
		Suffix("ON DUPLICATE KEY UPDATE `max_attempts`=VALUES(`max_attempts`), `time_allowed`=VALUES(`time_allowed`)").
		ToSql()
	if err != nil {
		return nil, err
	}

	tx, err := g.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, gameQuery, gameArgs...); err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, configQuery, configArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}
	if len(attemptModels) > 0 {
		attemptsBuilder := squirrel.
			Insert(GameAttemptTable).
			Columns(
				"`id`",
				"`order`",
				"`puzzle_block_id`",
				"`game_id`",
			)
		for _, attemptModel := range attemptModels {
			attemptsBuilder = attemptsBuilder.Values(
				attemptModel.ID,
				attemptModel.Order,
				attemptModel.PuzzleBlockID,
				attemptModel.GameID,
			)
		}
		attemptsQuery, attemptsArgs, err := attemptsBuilder.
			Suffix("ON DUPLICATE KEY UPDATE `order`=VALUES(`order`), `puzzle_block_id`=VALUES(`puzzle_block_id`)").
			ToSql()
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, attemptsQuery, attemptsArgs...); err != nil {
			tx.Rollback()
			return nil, err
		}
	}
	if len(correctModels) > 0 {
		correctsBuilder := squirrel.
			Insert(GameCorrectTable).
			Columns(
				"`id`",
				"`puzzle_group_id`",
				"`game_id`",
			)
		for _, correctModel := range correctModels {
			correctsBuilder = correctsBuilder.Values(
				correctModel.ID,
				correctModel.PuzzleGroupID,
				correctModel.GameID,
			)
		}
		correctsQuery, correctsArgs, err := correctsBuilder.
			Suffix("ON DUPLICATE KEY UPDATE `puzzle_group_id`=VALUES(`puzzle_group_id`)").
			ToSql()
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, correctsQuery, correctsArgs...); err != nil {
			tx.Rollback()
			return nil, err
		}
	}
	if len(resultModels) > 0 {
		resultsBuilder := squirrel.
			Insert(GameResultTable).
			Columns(
				"`id`",
				"`guess`",
				"`correct`",
				"`puzzle_group_id`",
				"`game_id`",
			)
		for _, resultModel := range resultModels {
			resultsBuilder = resultsBuilder.Values(
				resultModel.ID,
				resultModel.Guess,
				resultModel.Correct,
				resultModel.PuzzleGroupID,
				resultModel.GameID,
			)
		}
		resultsQuery, resultsArgs, err := resultsBuilder.
			Suffix("ON DUPLICATE KEY UPDATE `guess`=VALUES(`guess`), `correct`=VALUES(`correct`), `puzzle_group_id`=VALUES(`puzzle_group_id`)").
			ToSql()
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

	return &updateGame, nil
}

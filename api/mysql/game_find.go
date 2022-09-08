package mysql

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

// Helper function that retrieves a detailed game using a specific column and its value
func (g *game) find(ctx context.Context, column, search string) (*entities.Game, error) {
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
	).From(fmt.Sprintf("%s game", GameTable))
	// Join Game Config
	builder = builder.LeftJoin(fmt.Sprintf("%s game_config ON game_config.game_id = game.id", GameConfigTable))
	// Join Game Correct
	builder = builder.LeftJoin(fmt.Sprintf("%s game_correct ON game_correct.game_id = game.id", GameCorrectTable))
	// Join Game Result
	builder = builder.LeftJoin(fmt.Sprintf("%s game_result ON game_result.game_id = game.id", GameResultTable))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = game.user_id", UserTable))
	// Where
	builder = builder.Where(
		squirrel.And{
			squirrel.Eq{
				fmt.Sprintf("game.%s", column): search,
				"user.deleted_at":              nil,
			},
		},
	).GroupBy(
		"game.id",
		"game_config.id",
		"game_correct.id",
		"game_result.id",
		"user.id",
	)

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := g.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var gameModel models.Game
	var configModel models.GameConfig
	var correctModels []models.GameCorrect
	var resultModels []models.GameResult
	var userModel models.User
	var userState sql.NullString
	var userUsername sql.NullString
	var userCreatedAt sql.NullTime

	ids := map[uuid.UUID]bool{}

	for rows.Next() {
		var correctModel models.GameCorrect
		var resultModel models.GameResult

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
			&correctModel.ID,
			&correctModel.PuzzleGroupID,
			&resultModel.ID,
			&resultModel.Guess,
			&resultModel.Correct,
			&resultModel.PuzzleGroupID,
			&userModel.ID,
			&userState,
			&userUsername,
			&userCreatedAt,
			&userModel.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if _, ok := ids[correctModel.ID]; correctModel.ID != uuid.Nil && !ok {
			ids[correctModel.ID] = true
			correctModels = append(correctModels, correctModel)
		}
		if _, ok := ids[resultModel.ID]; resultModel.ID != uuid.Nil && !ok {
			ids[resultModel.ID] = true
			resultModels = append(resultModels, resultModel)
		}
	}

	// Double check game that was found from query
	if gameModel.ID == uuid.Nil || gameModel.PuzzleID == uuid.Nil {
		return nil, errors.New("game not found")
	}

	config := dtos.GameConfig().ToEntity(configModel)

	attempts, err := g.attempts(ctx, gameModel)
	if err != nil {
		return nil, err
	}

	puzzle, err := g.puzzle.Get(ctx, gameModel.PuzzleID)
	if err != nil {
		return nil, err
	}

	challengedBy, err := g.challengedBy(ctx, gameModel)
	if err != nil {
		return nil, err
	}
	if challengedBy != nil {
		challengedBy.Config = config
		challengedBy.Puzzle = dtos.Puzzle().ToNode(*puzzle)
	}

	corrects := []uuid.UUID{}
	for _, correct := range correctModels {
		corrects = append(corrects, correct.PuzzleGroupID)
	}
	results := []entities.GameResult{}
	for _, result := range resultModels {
		results = append(results, dtos.GameResult().ToEntity(result))
	}

	var user *entities.User
	if gameModel.UserID != nil && *gameModel.UserID != uuid.Nil {
		userModel.State = userState.String
		userModel.Username = userUsername.String
		userModel.CreatedAt = userCreatedAt.Time

		userEntity := dtos.User().ToEntity(userModel)
		user = &userEntity
	}

	game := dtos.Game().ToEntity(gameModel)
	game.Config = config
	game.Attempts = attempts
	game.Correct = corrects
	game.Results = results
	game.ChallengedBy = challengedBy
	game.Puzzle = *puzzle
	game.User = user

	return &game, nil
}

package mysql

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/google/uuid"
)

// Retrieves ChallengedBy field for a game
func (g *game) challengedBy(ctx context.Context, game models.Game) (*entities.GameNode, error) {
	if game.ChallengedBy == nil {
		return nil, nil
	}

	var gameModel models.Game
	var userModel models.User
	builder := squirrel.
		Select(
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
		).
		From(fmt.Sprintf("%s game", gameModel.TableName()))
	// Join Game Attempts
	builder = builder.LeftJoin(fmt.Sprintf("%s game_attempt ON game_attempt.game_id = game.id", new(models.GameAttempt).TableName()))
	// Join User
	builder = builder.LeftJoin(fmt.Sprintf("%s user ON user.id = game.user_id", userModel.TableName()))

	query, args, err := builder.
		Where("game.id = ? AND user.deleted_at IS NULL", game.ChallengedBy).
		GroupBy("game.id", "user.id").
		ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := g.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var numOfAttempts uint
	var userState sql.NullString
	var userUsername sql.NullString
	var userCreatedAt sql.NullTime

	for rows.Next() {
		if err := rows.Scan(
			&gameModel.ID,
			&gameModel.Score,
			&gameModel.ChallengeCode,
			&gameModel.CreatedAt,
			&gameModel.StartedAt,
			&gameModel.GuessedAt,
			&gameModel.CompletedAt,
			&gameModel.ChallengedBy,
			&userModel.ID,
			&userState,
			&userUsername,
			&userCreatedAt,
			&userModel.UpdatedAt,
			&numOfAttempts,
		); err != nil {
			return nil, err
		}
	}

	challengedBy := dtos.Game().ToNode(gameModel)
	challengedBy.Attempts = uint8(numOfAttempts)
	if gameModel.UserID != nil && *gameModel.UserID != uuid.Nil {
		userModel.State = userState.String
		userModel.Username = userUsername.String
		userModel.CreatedAt = userCreatedAt.Time

		user := dtos.User().ToEntity(userModel)
		challengedBy.User = &user
	}

	return &challengedBy, nil
}

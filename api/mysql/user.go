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
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

// Errors
var (
	ErrUserNotFound = errors.New("user was not found in context")
)

type user struct {
	db *sqlx.DB
}

func NewUser(db *sqlx.DB) repositories.User {
	logrus.Info("Created User MySQL Repository")

	return &user{
		db: db,
	}
}

func (u *user) Create(ctx context.Context, newConnection entities.Connection, newUser entities.User) (*entities.User, error) {
	userModel := dtos.User().ToModel(newUser)

	userQuery, userArgs, err := squirrel.
		Insert(UserTable).
		SetMap(map[string]interface{}{
			"id":         userModel.ID,
			"state":      userModel.State,
			"username":   userModel.Username,
			"created_at": userModel.CreatedAt,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	connectionModel := dtos.Connection().ToModel(newConnection)

	connectionQuery, connectionArgs, err := squirrel.
		Insert(ConnectionTable).
		SetMap(map[string]interface{}{
			"id":       connectionModel.ID,
			"provider": connectionModel.Provider,
			"sub":      connectionModel.Sub,
			"user_id":  connectionModel.UserID,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	tx, err := u.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, userQuery, userArgs...); err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, connectionQuery, connectionArgs...); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return nil, err
	}

	return &newUser, nil
}

func (u *user) Get(ctx context.Context, search string) (*entities.User, error) {
	query, args, err := squirrel.Select(
		"id",
		"state",
		"username",
		"created_at",
		"updated_at",
	).From(UserTable).
		Where("(id = ? OR username = ?) AND deleted_at IS NULL", search, search).
		ToSql()
	if err != nil {
		return nil, err
	}

	var model models.User

	row := u.db.QueryRowContext(ctx, query, args...)
	if err := row.Scan(
		&model.ID,
		&model.State,
		&model.Username,
		&model.CreatedAt,
		&model.UpdatedAt,
	); err != nil {
		return nil, err
	}

	entity := dtos.User().ToEntity(model)

	return &entity, nil
}

func (u *user) GetStats(ctx context.Context, id uuid.UUID) (*entities.Stats, error) {
	// TODO: There has to be a better way to handle this
	puzzleQuery, puzzleArgs, err := squirrel.
		Select("COUNT(id)").
		From(PuzzleTable).
		Where("user_id = ? AND deleted_at IS NULL", id).
		ToSql()
	if err != nil {
		return nil, err
	}
	puzzleLikeQuery, puzzleLikeArgs, err := squirrel.
		Select("COUNT(puzzle_like.id)").
		From(fmt.Sprintf("%s puzzle_like", PuzzleLikeTable)).
		LeftJoin(fmt.Sprintf("%s puzzle ON puzzle.id = puzzle_like.puzzle_id", PuzzleTable)).
		LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id AND user.deleted_at IS NULL", UserTable)).
		Where("puzzle_like.user_id = ? AND puzzle_like.active = true AND puzzle.deleted_at IS NULL", id).
		ToSql()
	if err != nil {
		return nil, err
	}
	gamePlayedQuery, gamePlayedArgs, err := squirrel.
		Select("COUNT(game.id)").
		From(fmt.Sprintf("%s game", GameTable)).
		LeftJoin(fmt.Sprintf("%s puzzle ON puzzle.id = game.puzzle_id", PuzzleTable)).
		LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id AND user.deleted_at IS NULL", UserTable)).
		Where("game.user_id = ? AND game.completed_at IS NOT NULL AND puzzle.deleted_at IS NULL AND user.deleted_at IS NULL", id).
		ToSql()
	if err != nil {
		return nil, err
	}

	var statsModel models.Stats

	puzzleRow := u.db.QueryRowContext(ctx, puzzleQuery, puzzleArgs...)
	if err := puzzleRow.Scan(&statsModel.PuzzlesCreated); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	puzzleLikeRow := u.db.QueryRowContext(ctx, puzzleLikeQuery, puzzleLikeArgs...)
	if err := puzzleLikeRow.Scan(&statsModel.PuzzlesLiked); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	gameRow := u.db.QueryRowContext(ctx, gamePlayedQuery, gamePlayedArgs...)
	if err := gameRow.Scan(&statsModel.GamesPlayed); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	stats := dtos.Stats().ToEntity(statsModel)

	return &stats, nil
}

func (u *user) GetWithConnection(ctx context.Context, provider, sub string) (*entities.User, error) {
	connectionQuery, connectionArgs, err := squirrel.Select("user_id").
		From(ConnectionTable).
		Where("provider = ? AND sub = ?", provider, sub).
		ToSql()
	if err != nil {
		return nil, err
	}

	var connectionModel models.Connection

	connectionRow := u.db.QueryRowContext(ctx, connectionQuery, connectionArgs...)
	if err := connectionRow.Scan(&connectionModel.UserID); err != nil {
		return nil, err
	}

	var userModel models.User

	userQuery, userArgs, err := squirrel.Select(
		"id",
		"state",
		"username",
		"created_at",
		"updated_at",
	).
		From(UserTable).
		Where("id = ? AND deleted_at IS NULL", connectionModel.UserID).
		ToSql()
	if err != nil {
		return nil, err
	}

	userRow := u.db.QueryRowContext(ctx, userQuery, userArgs...)

	if err := userRow.Scan(
		&userModel.ID,
		&userModel.State,
		&userModel.Username,
		&userModel.CreatedAt,
		&userModel.UpdatedAt,
	); err != nil {
		return nil, err
	}

	user := dtos.User().ToEntity(userModel)

	return &user, nil
}

func (u *user) Update(ctx context.Context, updateUser entities.User) (*entities.User, error) {
	model := dtos.User().ToModel(updateUser)
	model.RefreshUpdated()

	query, args, err := squirrel.Update(UserTable).
		Where("id = ? AND deleted_at IS NULL", model.ID).
		SetMap(map[string]interface{}{
			"state":      model.State,
			"username":   model.Username,
			"updated_at": model.UpdatedAt,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := u.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	return &updateUser, nil
}

func (u *user) Delete(ctx context.Context, id uuid.UUID) error {
	query, args, err := squirrel.
		Update(UserTable).
		Where("id = ? AND deleted_at IS NULL").
		SetMap(map[string]interface{}{
			"deleted_at": time.Now(),
		}).
		ToSql()
	if err != nil {
		return err
	}

	if _, err := u.db.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	return nil
}

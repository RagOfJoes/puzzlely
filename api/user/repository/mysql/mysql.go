package mysql

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/RagOfJoes/puzzlely/user/usecase"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type mysqlDB struct {
	db *sqlx.DB
}

func New(db *sqlx.DB) usecase.Repository {
	logrus.Info("Created User MySQL Repository")
	return &mysqlDB{
		db: db,
	}
}

// Create creates a new User
func (m *mysqlDB) Create(ctx context.Context, newUser user.User, newConnection user.Connection) (*user.User, error) {
	userModel := fromUserEntity(newUser)
	connectionModel := fromConnectionEntity(newConnection, userModel.ID)

	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	userQuery, userArgs, err := squirrel.Insert(ms.UsersTable).SetMap(map[string]interface{}{
		"id":         userModel.ID,
		"state":      userModel.State,
		"username":   userModel.Username,
		"created_at": userModel.CreatedAt,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := tx.ExecContext(ctx, userQuery, userArgs...); err != nil {
		return nil, err
	}

	connectionQuery, connectionArgs, err := squirrel.Insert(ms.ConnectionsTable).SetMap(map[string]interface{}{
		"id":       connectionModel.ID,
		"provider": connectionModel.Provider,
		"sub":      connectionModel.Sub,
		"user_id":  connectionModel.UserID,
	}).ToSql()
	if err != nil {
		tx.Rollback()
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

	entity := userModel.ToEntity()

	return &entity, nil
}

// Get retrieves a User with their id or username
func (m *mysqlDB) Get(ctx context.Context, search string) (*user.User, error) {
	query, args, err := squirrel.Select(
		"id",
		"state",
		"username",
		"created_at",
		"updated_at",
	).From(ms.UsersTable).Where("(id = ? OR username = ?) AND deleted_at IS NULL", search, search).ToSql()
	if err != nil {
		return nil, err
	}

	row := m.db.QueryRowContext(ctx, query, args...)

	var found User
	if err := row.Scan(
		&found.ID,
		&found.State,
		&found.Username,
		&found.CreatedAt,
		&found.UpdatedAt,
	); err != nil {
		return nil, err
	}

	entity := found.ToEntity()

	return &entity, nil
}

// GetStats retrieves User's relevant stats
func (m *mysqlDB) GetStats(ctx context.Context, id uuid.UUID) (*user.Stats, error) {
	// TODO: There has to be a better way to handle this
	var model Stats

	puzzleQuery, puzzleArgs, err := squirrel.
		Select("COUNT(id)").
		From(ms.PuzzlesTable).
		Where("user_id = ? AND deleted_at IS NULL", id).
		ToSql()
	if err != nil {
		return nil, err
	}

	puzzleRow := m.db.QueryRowContext(ctx, puzzleQuery, puzzleArgs...)
	if err := puzzleRow.Scan(&model.PuzzlesCreated); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	puzzleLikeQuery, puzzleLikeArgs, err := squirrel.
		Select("COUNT(puzzle_like.id)").
		From(fmt.Sprintf("%s puzzle_like", ms.PuzzleLikesTable)).
		LeftJoin(fmt.Sprintf("%s puzzle ON puzzle.id = puzzle_like.puzzle_id", ms.PuzzlesTable)).
		LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id AND user.deleted_at IS NULL", ms.UsersTable)).
		Where("puzzle_like.user_id = ? AND puzzle_like.active = true AND puzzle.deleted_at IS NULL", id).
		ToSql()
	if err != nil {
		return nil, err
	}

	puzzleLikeRow := m.db.QueryRowContext(ctx, puzzleLikeQuery, puzzleLikeArgs...)
	if err := puzzleLikeRow.Scan(&model.PuzzlesLiked); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	gamePlayedQuery, gamePlayedArgs, err := squirrel.
		Select("COUNT(game.id)").
		From(fmt.Sprintf("%s game", ms.GamesTable)).
		LeftJoin(fmt.Sprintf("%s puzzle ON puzzle.id = game.puzzle_id", ms.PuzzlesTable)).
		LeftJoin(fmt.Sprintf("%s user ON user.id = puzzle.user_id AND user.deleted_at IS NULL", ms.UsersTable)).
		Where("game.user_id = ? AND game.completed_at IS NOT NULL AND puzzle.deleted_at IS NULL AND user.deleted_at IS NULL", id).
		ToSql()
	if err != nil {
		return nil, err
	}

	gameRow := m.db.QueryRowContext(ctx, gamePlayedQuery, gamePlayedArgs...)
	if err := gameRow.Scan(&model.GamesPlayed); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	entity := model.ToEntity()

	return &entity, nil
}

// GetWithConnection retrieves a User with Connection
func (m *mysqlDB) GetWithConnection(ctx context.Context, provider string, sub string) (*user.User, error) {
	connectionQuery, connectionArgs, err := squirrel.Select("user_id").
		From(ms.ConnectionsTable).
		Where("provider = ? AND sub = ?", provider, sub).ToSql()
	if err != nil {
		return nil, err
	}

	connectionRow := m.db.QueryRowContext(ctx, connectionQuery, connectionArgs...)

	var userID uuid.UUID
	if err := connectionRow.Scan(&userID); err != nil {
		return nil, err
	}

	userQuery, userArgs, err := squirrel.Select(
		"id",
		"state",
		"username",
		"created_at",
		"updated_at",
	).From(ms.UsersTable).Where("id = ? AND deleted_at IS NULL", userID).ToSql()
	if err != nil {
		return nil, err
	}

	userRow := m.db.QueryRowContext(ctx, userQuery, userArgs...)

	var foundUser User
	if err := userRow.Scan(&foundUser.ID, &foundUser.State, &foundUser.Username, &foundUser.CreatedAt, &foundUser.UpdatedAt); err != nil {
		return nil, err
	}

	entity := foundUser.ToEntity()

	return &entity, nil
}

// Update updates a User
func (m *mysqlDB) Update(ctx context.Context, updateUser user.User) (*user.User, error) {
	model := fromUserEntity(updateUser)

	query, args, err := squirrel.Update(ms.UsersTable).
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

	if _, err := m.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	entity := model.ToEntity()

	return &entity, nil
}

// Delete deletes a User
func (m *mysqlDB) Delete(ctx context.Context, id uuid.UUID) error {
	query, args, err := squirrel.Update(ms.UsersTable).
		Where("id = ? AND deleted_at IS NULL", id).
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

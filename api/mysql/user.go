package mysql

import (
	"context"
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
	connectionModel := dtos.Connection().ToModel(newConnection)

	tx, err := u.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	userQuery, userArgs, err := squirrel.Insert(userModel.TableName()).SetMap(map[string]interface{}{
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

	connectionQuery, connectionArgs, err := squirrel.Insert(connectionModel.TableName()).SetMap(map[string]interface{}{
		"id":       connectionModel.ID,
		"provider": connectionModel.Provider,
		"sub":      connectionModel.Sub,
		"user_id":  connectionModel.UserID,
	}).ToSql()
	if err != nil {
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
	var model models.User

	query, args, err := squirrel.Select(
		"id",
		"state",
		"username",
		"created_at",
		"updated_at",
	).From(model.TableName()).
		Where("(id = ? OR username = ?) AND deleted_at IS NULL", search, search).
		ToSql()
	if err != nil {
		return nil, err
	}

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

// TODO: Finish this after Game and Puzzle has been refactored
func (u *user) GetStats(ctx context.Context, id uuid.UUID) (*entities.Stats, error) {
	return &entities.Stats{}, nil
}

func (u *user) GetWithConnection(ctx context.Context, provider, sub string) (*entities.User, error) {
	var user models.User
	var connection models.Connection

	connectionQuery, connectionArgs, err := squirrel.Select("user_id").
		From(connection.TableName()).
		Where("provider = ? AND sub = ?", provider, sub).
		ToSql()
	if err != nil {
		return nil, err
	}

	connectionRow := u.db.QueryRowContext(ctx, connectionQuery, connectionArgs...)

	if err := connectionRow.Scan(&connection.UserID); err != nil {
		return nil, err
	}

	userQuery, userArgs, err := squirrel.Select(
		"id",
		"state",
		"username",
		"created_at",
		"updated_at",
	).
		From(user.TableName()).
		Where("id = ? AND deleted_at IS NULL", connection.UserID).
		ToSql()
	if err != nil {
		return nil, err
	}

	userRow := u.db.QueryRowContext(ctx, userQuery, userArgs...)

	if err := userRow.Scan(
		&user.ID,
		&user.State,
		&user.Username,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}

	entity := dtos.User().ToEntity(user)

	return &entity, nil
}

func (u *user) Update(ctx context.Context, updateUser entities.User) (*entities.User, error) {
	model := dtos.User().ToModel(updateUser)
	model.RefreshUpdated()

	query, args, err := squirrel.Update(model.TableName()).
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
	var model models.User

	query, args, err := squirrel.Update(model.TableName()).
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

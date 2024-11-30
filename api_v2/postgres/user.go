package postgres

import (
	"context"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

var _ repositories.User = (*user)(nil)

type user struct {
	db *bun.DB
}

func NewUser(db *bun.DB) repositories.User {
	logrus.Info("Created User Postgres Repository")

	return &user{
		db: db,
	}
}

func (u *user) Create(ctx context.Context, newConnection domains.Connection, newUser domains.User) (*domains.User, error) {
	var user domains.User

	err := u.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewInsert().Model(&newUser).Returning("*").Exec(ctx, &user); err != nil {
			return err
		}
		if _, err := tx.NewInsert().Model(&newConnection).Exec(ctx); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (u *user) Get(ctx context.Context, id string) (*domains.User, error) {
	var user domains.User
	if err := u.db.NewSelect().Model(&user).Where("id = ?", id).Scan(ctx); err != nil {
		return nil, err
	}

	return &user, nil
}

func (u *user) GetWithConnection(ctx context.Context, connection domains.Connection) (*domains.User, error) {
	var foundConnection domains.Connection
	if err := u.db.NewSelect().
		Model(&foundConnection).
		Where("provider = ? AND sub = ?", connection.Provider, connection.Sub).
		Scan(ctx); err != nil {
		return nil, err
	}
	if err := foundConnection.Validate(); err != nil {
		return nil, err
	}

	var user domains.User
	if err := u.db.NewSelect().
		Model(&user).
		Where("id = ?", foundConnection.UserID).
		Scan(ctx); err != nil {
		return nil, err
	}
	if err := user.Validate(); err != nil {
		return nil, err
	}

	return &user, nil
}

func (u *user) Update(ctx context.Context, user domains.User) (*domains.User, error) {
	var updated domains.User
	_, err := u.db.NewUpdate().
		Model(&user).
		Where("id = ?", user.ID).
		Returning("*").
		Exec(ctx, &updated)
	if err != nil && IsUniqueError(err) {
		return nil, repositories.ErrUserUsernameNotAvailable
	} else if err != nil {
		return nil, err
	}

	return &updated, nil
}

func (u *user) Delete(ctx context.Context, id string) error {
	panic("unimplemented")
}

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
	var foundUser domains.User
	if err := u.db.NewSelect().Model(&foundUser).Where("id = ?", id).Scan(ctx); err != nil {
		return nil, err
	}

	return &foundUser, nil
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

	var foundUser domains.User
	if err := u.db.NewSelect().
		Model(&foundUser).
		Where("id = ?", foundConnection.UserID).
		Scan(ctx); err != nil {
		return nil, err
	}
	if err := foundUser.Validate(); err != nil {
		return nil, err
	}

	return &foundUser, nil
}

func (u *user) Update(ctx context.Context, user domains.User) (*domains.User, error) {
	panic("unimplemented")
}

func (u *user) Delete(ctx context.Context, id string) error {
	panic("unimplemented")
}

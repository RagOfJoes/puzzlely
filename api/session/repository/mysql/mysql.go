package mysql

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	ms "github.com/RagOfJoes/puzzlely/mysql"
	"github.com/RagOfJoes/puzzlely/session"
	"github.com/RagOfJoes/puzzlely/session/usecase"
	userMySQL "github.com/RagOfJoes/puzzlely/user/repository/mysql"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type mysqlDB struct {
	db *sqlx.DB
}

func New(db *sqlx.DB) usecase.Repository {
	logrus.Info("Created Session MySQL Repository")
	return &mysqlDB{
		db: db,
	}
}

// Create creates a new Session
func (m *mysqlDB) Create(ctx context.Context, newSession session.Session) (*session.Session, error) {
	model := fromEntity(newSession)

	query, args, err := squirrel.Insert(ms.SessionsTable).SetMap(map[string]interface{}{
		"id":               model.ID,
		"state":            model.State,
		"token":            model.Token,
		"created_at":       model.CreatedAt,
		"expires_at":       model.ExpiresAt,
		"authenticated_at": model.AuthenticatedAt,
		"user_id":          model.UserID,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := m.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	entity := model.toEntity()

	return &entity, nil
}

// Get retrieves a Session with id
func (m *mysqlDB) Get(ctx context.Context, id uuid.UUID) (*session.Session, error) {
	query, args, err := squirrel.Select(
		"session.id",
		"session.state",
		"session.token",
		"session.created_at",
		"session.expires_at",
		"session.authenticated_at",
		"session.user_id",
		"user.id",
		"user.state",
		"user.username",
		"user.created_at",
		"user.updated_at",
	).From(fmt.Sprintf("%s session", ms.SessionsTable)).
		LeftJoin(fmt.Sprintf("%s user ON user.id = session.user_id", ms.UsersTable)).
		Where("session.id = ? AND user.deleted_at IS NULL", id).
		ToSql()
	if err != nil {
		return nil, err
	}

	row := m.db.QueryRowContext(ctx, query, args...)

	var foundSession Session
	var foundUser userMySQL.User
	if err := row.Scan(
		&foundSession.ID,
		&foundSession.Token,
		&foundSession.State,
		&foundSession.CreatedAt,
		&foundSession.ExpiresAt,
		&foundSession.AuthenticatedAt,
		&foundSession.UserID,
		&foundUser.ID,
		&foundUser.State,
		&foundUser.Username,
		&foundUser.CreatedAt,
		&foundUser.UpdatedAt,
	); err != nil {
		return nil, err
	}

	user := foundUser.ToEntity()
	entity := foundSession.toEntity()
	entity.User = &user

	return &entity, nil
}

// GetWithToken retrieves a Session with token
func (m *mysqlDB) GetWithToken(ctx context.Context, token string) (*session.Session, error) {
	query, args, err := squirrel.Select(
		"session.id",
		"session.state",
		"session.token",
		"session.created_at",
		"session.expires_at",
		"session.authenticated_at",
		"session.user_id",
		"user.id",
		"user.state",
		"user.username",
		"user.created_at",
		"user.updated_at",
	).From(fmt.Sprintf("%s session", ms.SessionsTable)).
		LeftJoin(fmt.Sprintf("%s user ON user.id = session.user_id", ms.UsersTable)).
		Where("session.token = ? AND user.deleted_at IS NULL", token).
		ToSql()
	if err != nil {
		return nil, err
	}

	row := m.db.QueryRowContext(ctx, query, args...)

	var foundSession Session
	var foundUser userMySQL.User
	if err := row.Scan(
		&foundSession.ID,
		&foundSession.State,
		&foundSession.Token,
		&foundSession.CreatedAt,
		&foundSession.ExpiresAt,
		&foundSession.AuthenticatedAt,
		&foundSession.UserID,
		&foundUser.ID,
		&foundUser.State,
		&foundUser.Username,
		&foundUser.CreatedAt,
		&foundUser.UpdatedAt,
	); err != nil {
		return nil, err
	}

	user := foundUser.ToEntity()
	entity := foundSession.toEntity()
	entity.User = &user
	return &entity, nil
}

// Update updates a Session
func (m *mysqlDB) Update(ctx context.Context, updateSession session.Session) (*session.Session, error) {
	model := fromEntity(updateSession)

	query, args, err := squirrel.Update(ms.SessionsTable).Where("id = ?", model.ID).SetMap(map[string]interface{}{
		"state":            model.State,
		"expires_at":       model.ExpiresAt,
		"authenticated_at": model.AuthenticatedAt,
		"user_id":          model.UserID,
	}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := m.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	entity := model.toEntity()

	return &entity, nil
}

// Delete deletes a Session
func (m *mysqlDB) Delete(ctx context.Context, id uuid.UUID) error {
	query, args, err := squirrel.Delete(ms.SessionsTable).Where("id = ?", id).ToSql()
	if err != nil {
		return err
	}

	if _, err := m.db.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	return nil
}

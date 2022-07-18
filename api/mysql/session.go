package mysql

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type session struct {
	db *sqlx.DB
}

// NewSession creates a new MySQL session repository
func NewSession(db *sqlx.DB) repositories.Session {
	logrus.Info("Created Session MySQL Repository")

	return &session{
		db: db,
	}
}

func (s *session) Create(ctx context.Context, newSession entities.Session) (*entities.Session, error) {
	model := dtos.Session().ToModel(newSession)

	query, args, err := squirrel.Insert(model.TableName()).SetMap(map[string]interface{}{
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

	if _, err := s.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	return &newSession, nil
}

func (s *session) Get(ctx context.Context, id uuid.UUID) (*entities.Session, error) {
	return s.find(ctx, "id", id.String())
}

func (s *session) GetWithToken(ctx context.Context, token string) (*entities.Session, error) {
	return s.find(ctx, "token", token)
}

func (s *session) Update(ctx context.Context, updateSession entities.Session) (*entities.Session, error) {
	model := dtos.Session().ToModel(updateSession)

	query, args, err := squirrel.Update(model.TableName()).
		Where("id = ?", model.ID).
		SetMap(map[string]interface{}{
			"state":            model.State,
			"expires_at":       model.ExpiresAt,
			"authenticated_at": model.AuthenticatedAt,
			"user_id":          model.UserID,
		}).ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := s.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	return &updateSession, nil
}

func (s *session) Delete(ctx context.Context, id uuid.UUID) error {
	var model models.Session

	query, args, err := squirrel.Delete(model.TableName()).Where("id = ?", id).ToSql()
	if err != nil {
		return err
	}

	if _, err := s.db.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	return nil
}

func (s *session) find(ctx context.Context, column, value string) (*entities.Session, error) {
	var user models.User
	var model models.Session
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
	).From(fmt.Sprintf("%s session", model.TableName())).
		LeftJoin(fmt.Sprintf("%s user ON user.id = session.user_id", user.TableName())).
		Where(fmt.Sprintf("session.%s = ? AND user.deleted_at IS NULL", column), value).
		ToSql()
	if err != nil {
		return nil, err
	}

	row := s.db.QueryRowContext(ctx, query, args...)
	if err := row.Scan(
		&model.ID,
		&model.State,
		&model.Token,
		&model.CreatedAt,
		&model.ExpiresAt,
		&model.AuthenticatedAt,
		&model.UserID,
		&user.ID,
		&user.State,
		&user.Username,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}

	userEntity := dtos.User().ToEntity(user)

	entity := dtos.Session().ToEntity(model)
	entity.User = &userEntity

	return &entity, nil
}

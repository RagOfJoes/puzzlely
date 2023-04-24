package mysql

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/RagOfJoes/puzzlely/dtos"
	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/trace"
)

const (
	sessionTracer = "mysql.session"
)

type session struct {
	db     *sqlx.DB
	tracer trace.Tracer
}

// NewSession creates a new MySQL session repository
func NewSession(db *sqlx.DB) repositories.Session {
	logrus.Info("Created Session MySQL Repository")

	return &session{
		db:     db,
		tracer: telemetry.Tracer(sessionTracer),
	}
}

func (s *session) Create(ctx context.Context, newSession entities.Session) (*entities.Session, error) {
	ctx, span := s.tracer.Start(ctx, "Create")
	defer span.End()

	sessionModel := dtos.Session().ToModel(newSession)

	query, args, err := squirrel.
		Insert(SessionTable).
		SetMap(map[string]any{
			"id":               sessionModel.ID,
			"state":            sessionModel.State,
			"token":            sessionModel.Token,
			"created_at":       sessionModel.CreatedAt,
			"expires_at":       sessionModel.ExpiresAt,
			"authenticated_at": sessionModel.AuthenticatedAt,
			"user_id":          sessionModel.UserID,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := s.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	return &newSession, nil
}

func (s *session) Get(ctx context.Context, id uuid.UUID) (*entities.Session, error) {
	ctx, span := s.tracer.Start(ctx, "Get")
	defer span.End()

	return s.find(ctx, "id", id.String())
}

func (s *session) GetWithToken(ctx context.Context, token string) (*entities.Session, error) {
	ctx, span := s.tracer.Start(ctx, "GetWithToken")
	defer span.End()

	return s.find(ctx, "token", token)
}

func (s *session) Update(ctx context.Context, updateSession entities.Session) (*entities.Session, error) {
	ctx, span := s.tracer.Start(ctx, "Update")
	defer span.End()

	sessionModel := dtos.Session().ToModel(updateSession)

	query, args, err := squirrel.
		Update(SessionTable).
		Where("id = ?", sessionModel.ID).
		SetMap(map[string]any{
			"state":            sessionModel.State,
			"expires_at":       sessionModel.ExpiresAt,
			"authenticated_at": sessionModel.AuthenticatedAt,
			"user_id":          sessionModel.UserID,
		}).
		ToSql()
	if err != nil {
		return nil, err
	}

	if _, err := s.db.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	return &updateSession, nil
}

func (s *session) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, span := s.tracer.Start(ctx, "Delete")
	defer span.End()

	query, args, err := squirrel.Delete(SessionTable).Where("id = ?", id).ToSql()
	if err != nil {
		return err
	}

	if _, err := s.db.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	return nil
}

func (s *session) find(ctx context.Context, column, value string) (*entities.Session, error) {
	ctx, span := s.tracer.Start(ctx, "find")
	defer span.End()

	query, args, err := squirrel.
		Select(
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
		).
		From(fmt.Sprintf("%s session", SessionTable)).
		LeftJoin(fmt.Sprintf("%s user ON user.id = session.user_id", UserTable)).
		Where(fmt.Sprintf("session.%s = ? AND user.deleted_at IS NULL", column), value).
		ToSql()
	if err != nil {
		return nil, err
	}

	var userModel models.User
	var sessionModel models.Session

	row := s.db.QueryRowContext(ctx, query, args...)
	if err := row.Scan(
		&sessionModel.ID,
		&sessionModel.State,
		&sessionModel.Token,
		&sessionModel.CreatedAt,
		&sessionModel.ExpiresAt,
		&sessionModel.AuthenticatedAt,
		&sessionModel.UserID,
		&userModel.ID,
		&userModel.State,
		&userModel.Username,
		&userModel.CreatedAt,
		&userModel.UpdatedAt,
	); err != nil {
		return nil, err
	}

	session := dtos.Session().ToEntity(sessionModel)

	user := dtos.User().ToEntity(userModel)
	session.User = &user

	return &session, nil
}

package postgres

import (
	"context"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
	"go.opentelemetry.io/otel/trace"
)

var _ repositories.User = (*user)(nil)

type user struct {
	tracer trace.Tracer

	db *bun.DB
}

func NewUser(db *bun.DB) repositories.User {
	logrus.Info("Created User Postgres Repository")

	return &user{
		tracer: telemetry.Tracer("postgres.user"),

		db: db,
	}
}

func (u *user) Create(ctx context.Context, connectionPayload domains.Connection, userPayload domains.User) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "Create", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var user domains.User
	err := u.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewInsert().Model(&userPayload).Returning("*").Exec(ctx, &user); err != nil {
			return err
		}
		if _, err := tx.NewInsert().Model(&connectionPayload).Exec(ctx); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &user, nil
}

func (u *user) Get(ctx context.Context, id string) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "Get", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var user domains.User
	if err := u.db.NewSelect().Model(&user).Where("id = ?", id).Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &user, nil
}

func (u *user) GetWithConnection(ctx context.Context, payload domains.Connection) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "GetWithConnection", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var connection domains.Connection
	if err := u.db.NewSelect().
		Model(&connection).
		Where("provider = ? AND sub = ?", payload.Provider, payload.Sub).
		Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	var user domains.User
	if err := u.db.NewSelect().
		Model(&user).
		Where("id = ?", connection.UserID).
		Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &user, nil
}

func (u *user) Update(ctx context.Context, payload domains.User) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "Update", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var user domains.User
	_, err := u.db.NewUpdate().
		Model(&payload).
		Where("id = ?", payload.ID).
		Returning("*").
		Exec(ctx, &user)
	if err != nil && IsUniqueError(err) {
		span.SetStatus(codes.Error, "")
		span.RecordError(repositories.ErrUserUsernameNotAvailable)

		return nil, repositories.ErrUserUsernameNotAvailable
	} else if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &user, nil
}

func (u *user) Delete(ctx context.Context, id string) error {
	panic("unimplemented")
}

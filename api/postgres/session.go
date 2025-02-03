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

var _ repositories.Session = (*session)(nil)

type session struct {
	tracer trace.Tracer

	db *bun.DB
}

func NewSession(db *bun.DB) repositories.Session {
	logrus.Info("Created Session Postgres Repository")

	return &session{
		tracer: telemetry.Tracer("postgres.session"),

		db: db,
	}
}

func (s *session) Create(ctx context.Context, payload domains.Session) (*domains.Session, error) {
	ctx, span := s.tracer.Start(ctx, "Create", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var session domains.Session
	if _, err := s.db.NewInsert().Model(&payload).Returning("*").Exec(ctx, &session); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &session, nil
}

func (s *session) Get(ctx context.Context, id string) (*domains.Session, error) {
	ctx, span := s.tracer.Start(ctx, "Get", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	var session domains.Session
	if err := s.db.NewSelect().
		Model(&session).
		Where("session.id = ?", id).
		Relation("User").
		Scan(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &session, nil
}

func (s *session) Update(ctx context.Context, payload domains.Session) (*domains.Session, error) {
	ctx, span := s.tracer.Start(ctx, "Update", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	if _, err := s.db.NewUpdate().Model(&payload).WherePK().Exec(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return &payload, nil
}

func (s *session) Delete(ctx context.Context, id string) error {
	ctx, span := s.tracer.Start(ctx, "Delete", trace.WithSpanKind(trace.SpanKindClient), trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
	))
	defer span.End()

	if _, err := s.db.NewDelete().Model(&domains.Session{}).Where("id = ?", id).Exec(ctx); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return err
	}

	return nil
}

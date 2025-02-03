package services

import (
	"context"
	"database/sql"
	"errors"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

// Errors
var (
	ErrSessionCreate    = errors.New("Failed to create session.")
	ErrSessionDelete    = errors.New("Failed to delete session.")
	ErrSessionInvalid   = errors.New("Invalid session provided.")
	ErrSessionInvalidID = errors.New("Invalid session id provided.")
	ErrSessionUpdate    = errors.New("Failed to update session.")
)

// Session defines the session service
type Session struct {
	tracer trace.Tracer

	repository repositories.Session
}

type SessionDependencies struct {
	Repository repositories.Session
}

// NewSession instantiates a session service
func NewSession(dependencies SessionDependencies) Session {
	logrus.Print("Created Session Service")

	return Session{
		tracer: telemetry.Tracer("services.session"),

		repository: dependencies.Repository,
	}
}

// New creates a new session
func (s *Session) New(ctx context.Context, payload domains.Session) (*domains.Session, error) {
	ctx, span := s.tracer.Start(ctx, "New", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	if err := payload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalid)
	}

	session, err := s.repository.Create(ctx, payload)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionCreate)
	}

	return session, nil
}

// FindByID retrieves a session with its id
func (s *Session) FindByID(ctx context.Context, id ulid.ULID) (*domains.Session, error) {
	ctx, span := s.tracer.Start(ctx, "FindByID", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	session, err := s.repository.Get(ctx, id.String())
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}
	if err := session.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}
	strip(session)

	return session, nil
}

// Update updates a session
func (s *Session) Update(ctx context.Context, payload domains.Session) (*domains.Session, error) {
	ctx, span := s.tracer.Start(ctx, "Update", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	if err := payload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalid)
	}

	session, err := s.repository.Update(ctx, payload)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionUpdate)
	}
	strip(session)

	return session, nil
}

// Delete deletes a session
func (s *Session) Delete(ctx context.Context, id ulid.ULID) error {
	ctx, span := s.tracer.Start(ctx, "Delete", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	if err := s.repository.Delete(ctx, id.String()); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionDelete)
	}

	return nil
}

// Ensure that a user isn't accidentally sent over to the client if not properly authenticated
func strip(session *domains.Session) {
	if !session.IsAuthenticated() {
		session.UserID = sql.NullString{
			String: "",
			Valid:  false,
		}
		session.User = nil
	}
}

package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
	"go.opentelemetry.io/otel/trace"
)

var (
	ErrSessionInvalidID = errors.New("Invalid session id found.")
	ErrSessionNotFound  = errors.New("No active session found.")
)

type session struct {
	config config.Configuration
	tracer trace.Tracer

	service services.Session
}

type SessionDependencies struct {
	Config config.Configuration

	Service services.Session
}

// Session creates an instance that exposes useful methods for session management
func Session(dependencies SessionDependencies) session {
	return session{
		config: dependencies.Config,
		tracer: telemetry.Tracer("handlers.session"),

		service: dependencies.Service,
	}
}

// Get retrieves a session from either the request header or a cookie. If an authenticated session is found then it will be added to request's context
//
// NOTE: Internal method that should only be used inside other handler methods
func (s *session) Get(w http.ResponseWriter, r *http.Request, mustBeAuthenticated bool) (*domains.Session, error) {
	span := trace.SpanFromContext(r.Context())
	defer span.AddEvent("handlers.session.Get END")

	// Add event for this specific method
	span.AddEvent("handlers.session.Get START")

	header := r.Header.Get("Authorization")
	token := strings.TrimPrefix(header, "Bearer ")
	if token == header {
		span.RecordError(ErrSessionInvalidID)

		return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	id, err := ulid.Parse(token)
	if err != nil {
		span.RecordError(ErrSessionInvalidID)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	session, err := s.service.FindByID(r.Context(), id)
	if err != nil {
		span.RecordError(ErrSessionNotFound)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}
	if mustBeAuthenticated && !session.IsAuthenticated() {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrSessionNotFound)

		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}

	if session != nil {
		span.SetAttributes(semconv.SessionID(token))
	}

	if session.IsAuthenticated() {
		span.SetAttributes(semconv.EnduserID(session.UserID.String))

		// Update request with updated context
		*r = *r.WithContext(domains.SessionNewContext(r.Context(), *session))
	}

	return session, nil
}

// Upsert will either update an existing session or create a new one based on the one that is passed
func (s *session) Upsert(w http.ResponseWriter, r *http.Request, upsertSession domains.Session) (*domains.Session, error) {
	span := trace.SpanFromContext(r.Context())
	defer span.AddEvent("handlers.session.Upsert END")

	// Add event for this specific method
	span.AddEvent("handlers.session.Upsert START")

	id, err := ulid.Parse(upsertSession.ID)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrSessionInvalidID)

		return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	old, _ := s.service.FindByID(r.Context(), id)
	if old != nil {
		session, err := s.service.Update(r.Context(), upsertSession)
		if err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			return nil, err
		}

		return session, nil
	}

	session, err := s.service.New(r.Context(), upsertSession)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, err
	}

	return session, nil
}

// Destroy removes a session from repository layer and the cookie store
//
// NOTE: Make sure to call the `Get` method before this to make sure we set the `Session` in the context
func (s *session) Destroy(w http.ResponseWriter, r *http.Request) error {
	span := trace.SpanFromContext(r.Context())
	defer span.AddEvent("handlers.session.Destroy END")

	// Add event for this specific method
	span.AddEvent("handlers.session.Destroy START")

	old := domains.SessionFromContext(r.Context())
	if old == nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrUnauthorized)

		return internal.NewErrorf(internal.ErrorCodeForbidden, "%v", ErrUnauthorized)
	}

	id, err := ulid.Parse(old.ID)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrSessionInvalidID)

		return internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	if err := s.service.Delete(r.Context(), id); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return err
	}

	return nil
}

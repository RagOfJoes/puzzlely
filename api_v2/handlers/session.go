package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/oklog/ulid/v2"
)

var (
	ErrSessionInvalidID = errors.New("Invalid session id found.")
	ErrSessionNotFound  = errors.New("No active session found.")
)

type session struct {
	config config.Configuration

	service services.Session
}

type SessionDependencies struct {
	Config config.Configuration

	Service services.Session
}

// Session creates an instance that exposes useful methods to managing a session
func Session(dependencies SessionDependencies) session {
	return session{
		config: dependencies.Config,

		service: dependencies.Service,
	}
}

// Get retrieves a session from either the request header or a cookie. If an authenticated session is found then it will be added to request's context
func (s *session) Get(w http.ResponseWriter, r *http.Request, mustBeAuthenticated bool) (*domains.Session, error) {
	header := r.Header.Get("Authorization")
	token := strings.TrimPrefix(header, "Bearer ")
	if token == header {
		return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	id, err := ulid.Parse(token)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	session, err := s.service.FindByID(r.Context(), id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}
	if mustBeAuthenticated && !session.IsAuthenticated() {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}

	if session.IsAuthenticated() {
		// Update request with updated context
		*r = *r.WithContext(domains.SessionNewContext(r.Context(), *session))
	}

	return session, nil
}

// Upsert will either update an existing session or create a new one based on the one that is passed
func (s *session) Upsert(w http.ResponseWriter, r *http.Request, upsertSession domains.Session) (*domains.Session, error) {
	ctx := r.Context()

	id, err := ulid.Parse(upsertSession.ID)
	if err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	oldSession, _ := s.service.FindByID(ctx, id)
	if oldSession != nil {
		session, err := s.service.Update(ctx, upsertSession)
		if err != nil {
			return nil, err
		}

		return session, nil
	}

	session, err := s.service.New(ctx, upsertSession)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// Destroy removes a session from repository layer and the cookie store
//
// NOTE: Make sure to call the `Get` method before this to make sure we set the `Session` in the context
func (s *session) Destroy(w http.ResponseWriter, r *http.Request) error {
	ctx := r.Context()

	oldSession := domains.SessionFromContext(ctx)
	if oldSession == nil {
		return internal.NewErrorf(internal.ErrorCodeForbidden, "%v", ErrUnauthorized)
	}

	id, err := ulid.Parse(oldSession.ID)
	if err != nil {
		return internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	if err := s.service.Delete(ctx, id); err != nil {
		return err
	}

	return nil
}

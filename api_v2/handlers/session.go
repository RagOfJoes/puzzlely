package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/gorilla/sessions"
	"github.com/oklog/ulid/v2"
)

const (
	sessionStoreKey string = "_session"
)

var (
	ErrSessionBasecampID = errors.New("Basecamp ID does not match.")
	ErrSessionInvalidID  = errors.New("Invalid session id found.")
	ErrSessionNotFound   = errors.New("No active session found.")
	ErrSessionStoreGet   = errors.New("Failed to retrieve cookie from cookie store.")
	ErrSessionStoreSave  = errors.New("Failed to save cookie to cookie store.")
)

type session struct {
	config config.Configuration
	store  sessions.Store

	service services.Session
}

type SessionDependencies struct {
	Config config.Configuration

	Service services.Session
}

// Session creates an instance that exposes useful methods to managing a session
func Session(dependencies SessionDependencies) session {
	secrets := [][]byte{}
	for _, secret := range dependencies.Config.Session.Cookie.Secrets {
		secrets = append(secrets, []byte(secret))
	}

	store := sessions.NewCookieStore(secrets...)
	store.Options = &sessions.Options{
		Path:     dependencies.Config.Session.Cookie.Path,
		Domain:   dependencies.Config.Session.Cookie.Domain,
		SameSite: dependencies.Config.Session.Cookie.SameSite,
		MaxAge:   int(dependencies.Config.Session.Lifetime.Seconds()),
		Secure:   dependencies.Config.Environment == config.Production,
		HttpOnly: dependencies.Config.Environment == config.Production,
	}

	return session{
		config: dependencies.Config,
		store:  store,

		service: dependencies.Service,
	}
}

// SetCookie stores session token into cookie store
func (s *session) SetCookie(w http.ResponseWriter, r *http.Request, session domains.Session) error {
	cookie, err := s.store.Get(r, s.config.Session.Cookie.Name)
	if err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionStoreGet)
	}

	cookie.Options.MaxAge = int(session.ExpiresAt.Time.Sub(time.Now()).Seconds())
	cookie.Values[sessionStoreKey] = session.ID
	if err := cookie.Save(r, w); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionStoreSave)
	}

	return nil
}

// Get retrieves a session from either the request header or a cookie. If an authenticated session is found then it will be added to request's context
func (s *session) Get(w http.ResponseWriter, r *http.Request, mustBeAuthenticated bool) (*domains.Session, error) {
	cookie, err := s.store.Get(r, s.config.Session.Cookie.Name)
	// Delete cookie if an error occurred
	if err != nil {
		cookie.Options.MaxAge = -1
		if err := cookie.Save(r, w); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionStoreSave)
		}

		return nil, err
	}

	value, ok := cookie.Values[sessionStoreKey].(string)
	if !ok {
		return nil, internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	id, err := ulid.Parse(value)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionInvalidID)
	}

	ctx := r.Context()
	session, err := s.service.FindByID(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}
	if mustBeAuthenticated && !session.IsAuthenticated() {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}

	if session.IsAuthenticated() {
		ctx = domains.SessionNewContext(ctx, *session)

		// Update request with updated context
		*r = *r.WithContext(ctx)
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

	cookie, err := s.store.Get(r, s.config.Session.Cookie.Name)
	if err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionStoreGet)
	}

	cookie.Options.MaxAge = -1
	if err := cookie.Save(r, w); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionStoreSave)
	}

	return nil
}

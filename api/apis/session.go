package apis

import (
	"errors"
	"net/http"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/gorilla/sessions"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

const (
	sessionTracer = "apis.session"
	tokenStoreKey = "_session"
)

var (
	ErrSessionInvalidToken = errors.New("Invalid session token found.")
	ErrSessionNotFound     = errors.New("No active session found.")
	ErrSessionStoreGet     = errors.New("Failed to retrieve cookie from cookie store.")
	ErrSessionStoreSave    = errors.New("Failed to save cookie to cookie store.")
)

type session struct {
	config  config.Configuration
	service services.Session
	store   sessions.Store
}

// Session creates an instance that exposes useful methods to managing a session
func Session(cfg config.Configuration, service services.Session) session {
	secrets := [][]byte{}
	for _, secret := range cfg.Session.Cookie.Secrets {
		secrets = append(secrets, []byte(secret))
	}

	store := sessions.NewCookieStore(secrets...)
	store.Options = &sessions.Options{
		Path:     cfg.Session.Cookie.Path,
		Domain:   cfg.Session.Cookie.Domain,
		SameSite: cfg.Session.Cookie.SameSite,
		MaxAge:   int(cfg.Session.Lifetime.Seconds()),
		Secure:   cfg.Environment == config.Production,
		HttpOnly: cfg.Environment == config.Production,
	}

	return session{
		config:  cfg,
		service: service,
		store:   store,
	}
}

// New creates a new session
func (s *session) New(w http.ResponseWriter, r *http.Request) (*entities.Session, error) {
	ctx := r.Context()

	newSession := entities.NewSession()

	session, err := s.service.New(ctx, newSession)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// SetCookie stores session token into cookie store
func (s *session) SetCookie(w http.ResponseWriter, r *http.Request, session entities.Session) error {
	cookie, err := s.store.Get(r, s.config.Session.Cookie.Name)
	if err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionStoreGet)
	}

	cookie.Values[tokenStoreKey] = session.Token
	if err := cookie.Save(r, w); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrSessionStoreSave)
	}

	return nil
}

// Get retrieves a session from either the request header or a cookie. If an authenticated session is found then it will be added to request's context
func (s *session) Get(w http.ResponseWriter, r *http.Request, mustBeAuthenticated bool) (*entities.Session, error) {
	token, err := s.getToken(w, r)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}

	ctx := r.Context()
	session, err := s.service.FindByToken(ctx, token)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}
	if mustBeAuthenticated && !session.IsAuthenticated() {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", ErrSessionNotFound)
	}

	if session.IsAuthenticated() {
		ctx = entities.UserNewContext(ctx, *session.User)

		// NOTE: Telemetry
		// Set `user.id` attribute to span
		trace.SpanFromContext(ctx).SetAttributes(attribute.KeyValue{
			Key:   "user.id",
			Value: attribute.StringValue(session.User.ID.String()),
		})

		// Update request with updated context
		*r = *r.WithContext(ctx)
	}

	return session, nil
}

// Upsert will either update an existing session or create a new one based on the one that is passed
func (s *session) Upsert(w http.ResponseWriter, r *http.Request, upsertSession entities.Session) (*entities.Session, error) {
	ctx := r.Context()

	oldSession, _ := s.service.FindByID(ctx, upsertSession.ID)
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

	oldSession, err := s.Get(w, r, false)
	if err != nil {
		return err
	}

	if err := s.service.Delete(ctx, oldSession.ID); err != nil {
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

// Helper function that will retrieve a session token using either the request header or a cookie
func (s *session) getToken(w http.ResponseWriter, r *http.Request) (string, error) {
	// First check Headers
	if token := r.Header.Get("X-Session-Token"); token != "" {
		return token, nil
	}
	// Then check for cookie
	cookie, err := s.store.Get(r, s.config.Session.Cookie.Name)
	// Delete cookie if an error occurred
	if err != nil {
		cookie.Options.MaxAge = -1
		if err := cookie.Save(r, w); err != nil {
			return "", err
		}
		return "", err
	}

	token, ok := cookie.Values[tokenStoreKey].(string)
	if !ok {
		return "", ErrSessionInvalidToken
	}

	return token, nil
}

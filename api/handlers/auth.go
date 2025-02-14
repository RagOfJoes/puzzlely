package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptrace"
	"strconv"
	"strings"
	"time"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

var (
	ErrAuthAlreadyAuthenticated = errors.New("Cannot access this resource while logged in.")
	ErrAuthDiscord              = errors.New("Failed to retrieve Discord profile from response.")
	ErrAuthGitHub               = errors.New("Failed to retrieve GitHub profile from response.")
	ErrAuthGoogle               = errors.New("Failed to retrieve Google profile from response.")
	ErrAuthInvalidToken         = errors.New("Must provide a valid access token.")
	ErrAuthProfile              = errors.New("Failed to retrieve profile from response.")
)

type auth struct {
	config config.Configuration

	oauth2 services.OAuth2Config
	user   services.User

	session session
}

type AuthDependencies struct {
	Config config.Configuration

	OAuth2 services.OAuth2Config
	User   services.User

	Session session
}

func Auth(dependencies AuthDependencies, router *chi.Mux) {
	a := auth{
		config: dependencies.Config,

		oauth2: dependencies.OAuth2,
		user:   dependencies.User,

		session: dependencies.Session,
	}

	router.Post("/auth/{provider}", a.authenticate)
	router.Delete("/logout", a.logout)
}

// Helper function to retrieve the sub from the OAuth2 provider
func (a *auth) sub(r *http.Request) (string, error) {
	provider := chi.URLParam(r, "provider")

	// Attempt to retrieve Bearer token from OAuth2 Provider
	header := r.Header.Get("Authorization")
	token := strings.TrimPrefix(header, "Bearer ")
	if token == header {
		return "", internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrAuthInvalidToken)
	}

	var url, clientID, clientSecret string
	switch provider {
	case "discord":
		url = a.config.Providers.Discord.URL
		clientID = a.config.Providers.Discord.ClientID
		clientSecret = a.config.Providers.Discord.ClientSecret
	case "github":
		url = a.config.Providers.GitHub.URL
		clientID = a.config.Providers.GitHub.ClientID
		clientSecret = a.config.Providers.GitHub.ClientSecret
	case "google":
		url = a.config.Providers.Google.URL
		clientID = a.config.Providers.Google.ClientID
		clientSecret = a.config.Providers.Google.ClientSecret
	default:
		return "", fmt.Errorf("%s is not a supported provider", provider)
	}

	timeout := time.Duration(10 * time.Second)
	client := http.Client{
		Timeout: timeout,
		Transport: otelhttp.NewTransport(
			http.DefaultTransport,
			otelhttp.WithClientTrace(func(ctx context.Context) *httptrace.ClientTrace {
				return otelhttptrace.NewClientTrace(ctx)
			}),
			otelhttp.WithSpanNameFormatter(func(operation string, r *http.Request) string {
				return fmt.Sprintf("HTTP %s %s", operation, r.URL.Host)
			}),
		),
	}

	req, err := http.NewRequestWithContext(r.Context(), "GET", fmt.Sprintf("%s?client_id=%s&client_secret=%s", url, clientID, clientSecret), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		return "", internal.WrapErrorf(err, internal.ErrorCodeInternal, "Failed to create request to %s", url)
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", internal.WrapErrorf(err, internal.ErrorCodeInternal, "%s responded with %s.", provider, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", internal.WrapErrorf(err, internal.ErrorCodeInternal, "Failed read body.")
	}

	switch provider {
	case "discord":
		var user struct {
			ID            string `json:"id"`
			Name          string `json:"username"`
			Email         string `json:"email"`
			AvatarID      string `json:"avatar"`
			MFAEnabled    bool   `json:"mfa_enabled"`
			Discriminator string `json:"discriminator"`
			Verified      bool   `json:"verified"`
		}

		if err := json.Unmarshal(body, &user); err != nil {
			return "", internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrAuthDiscord)
		}

		return user.ID, nil
	case "github":
		var user struct {
			ID       int    `json:"id"`
			Email    string `json:"email"`
			Bio      string `json:"bio"`
			Name     string `json:"name"`
			Login    string `json:"login"`
			Picture  string `json:"avatar_url"`
			Location string `json:"location"`
		}

		if err := json.Unmarshal(body, &user); err != nil {
			return "", internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrAuthGitHub)
		}

		return strconv.Itoa(user.ID), nil
	case "google":
		var user struct {
			ID        string `json:"sub"`
			Email     string `json:"email"`
			Name      string `json:"name"`
			FirstName string `json:"given_name"`
			LastName  string `json:"family_name"`
			Link      string `json:"link"`
			Picture   string `json:"picture"`
		}

		if err := json.Unmarshal(body, &user); err != nil {
			return "", internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrAuthGoogle)
		}

		return user.ID, nil
	default:
		return "", internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrAuthProfile)
	}
}

func (a *auth) authenticate(w http.ResponseWriter, r *http.Request) {
	span := trace.SpanFromContext(r.Context())

	// Get existing session or create a new one
	session, _ := a.session.Get(w, r, false)
	if session != nil && session.IsAuthenticated() {
		span.SetStatus(codes.Error, "")
		span.RecordError(ErrAuthAlreadyAuthenticated)

		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeForbidden, "%v", ErrAuthAlreadyAuthenticated))
		return
	} else if session == nil || session.IsExpired() {
		newSession := domains.NewSession()
		session = &newSession
	}

	provider := chi.URLParam(r, "provider")
	sub, err := a.sub(r)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	status := http.StatusOK

	connection := domains.Connection{
		Provider: provider,
		Sub:      sub,
	}
	user, err := a.user.FindWithConnection(r.Context(), connection)
	if err != nil {
		newUser := domains.NewUser()
		newConnection := domains.NewConnection(provider, sub, newUser.ID)

		createdUser, err := a.user.New(r.Context(), newConnection, newUser)
		if err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			render.Respond(w, r, err)
			return
		}

		user = createdUser
		status = http.StatusCreated
	}

	if err := session.Authenticate(time.Now().Add(a.config.Session.Lifetime), *user); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		render.Respond(w, r, err)
		return
	}

	if _, err := a.session.Upsert(w, r, *session); err != nil {
		render.Respond(w, r, err)
		return
	}

	session.User = user
	if status == http.StatusCreated {
		render.Render(w, r, Created("", session))
		return
	}

	render.Render(w, r, Ok("", session))
}

func (a *auth) logout(w http.ResponseWriter, r *http.Request) {
	// Make sure that the user is authenticated
	_, err := a.session.Get(w, r, true)
	if err != nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	// Destroy the session
	a.session.Destroy(w, r)

	// Respond with a 200 OK
	render.Render(w, r, Ok("", true))
}

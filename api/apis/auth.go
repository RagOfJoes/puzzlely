package apis

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.opentelemetry.io/otel/trace"
)

const (
	authTracer       = "apis.auth"
	discordAvatarURL = "https://media.discordapp.net/avatars/"
)

var (
	ErrAuthAlreadyAuthenticated = errors.New("Cannot access this resource while logged in.")
	ErrAuthDiscord              = errors.New("Failed to retrieve Discord profile from response.")
	ErrAuthGitHub               = errors.New("Failed to retrieve GitHub profile from response.")
	ErrAuthGoogle               = errors.New("Failed to retrieve Google profile from response.")
	ErrAuthProfile              = errors.New("Failed to retrieve profile from response.")
	ErrAuthInvalidToken         = errors.New("Must provide a valid access token.")
)

type auth struct {
	config  config.Configuration
	session session
	tracer  trace.Tracer
	user    services.User
}

// Auth registers auth endpoints and handlers to router
func Auth(cfg config.Configuration, sess session, user services.User, router *chi.Mux) {
	a := auth{
		config:  cfg,
		session: sess,
		tracer:  telemetry.Tracer(authTracer),
		user:    user,
	}

	router.Post("/auth/{provider}", a.authenticate)
	router.Delete("/logout", a.logout)
}

func (a *auth) authenticate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Attempt to retrieve Bearer token from OAuth2 Provider
	header := r.Header.Get("Authorization")
	token := strings.TrimPrefix(header, "Bearer ")
	if token == header {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", ErrAuthInvalidToken))
		return
	}

	// Get existing session or create a new one
	session, _ := a.session.Get(w, r, false)
	if session != nil && session.IsAuthenticated() {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeForbidden, "%v", ErrAuthAlreadyAuthenticated))
		return
	} else if session == nil || session.IsExpired() {
		newSession := entities.NewSession()
		session = &newSession
	}

	var url, clientID, clientSecret string
	provider := chi.URLParam(r, "provider")
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
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeNotFound, "%s is not a supported provider", provider))
		return
	}

	bits, err := a.getProfile(ctx, provider, url, clientID, clientSecret, header)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	id, err := parseResponse(bits, provider)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	status := http.StatusOK
	user, _ := a.user.FindWithConnection(ctx, provider, id)
	if user == nil {
		newUser := entities.NewUser()
		newConnection := entities.NewConnection(provider, id, newUser.ID)

		createdUser, err := a.user.New(ctx, newConnection, newUser)
		if err != nil {
			render.Respond(w, r, err)
			return
		}

		user = createdUser
		status = http.StatusCreated
	}

	if err := session.Authenticate(a.config.Session.Lifetime, *user); err != nil {
		render.Respond(w, r, err)
		return
	}

	if _, err := a.session.Upsert(w, r, *session); err != nil {
		render.Respond(w, r, err)
		return
	}
	if err := a.session.SetCookie(w, r, *session); err != nil {
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
	session, err := a.session.Get(w, r, true)
	if err != nil || session == nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", ErrUnauthorized))
		return
	}

	a.session.Destroy(w, r)

	render.Render(w, r, Ok("", nil))
}

// Retrieves profile from OAuth2 provider using Bearer Token
func (a *auth) getProfile(ctx context.Context, provider, url, clientID, clientSecret, bearerToken string) ([]byte, error) {
	ctx, span := a.tracer.Start(ctx, "getProfile")
	defer span.End()

	timeout := time.Duration(10 * time.Second)
	client := http.Client{
		Timeout: timeout,
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s?client_id=%s&client_secret=%s", url, clientID, clientSecret), nil)
	req.Header.Set("Authorization", bearerToken)
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "Failed to create request to %s", url)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%s responded with %s.", provider, err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "Failed read body.")
	}

	return body, nil
}

// Parses response from OAuth2 provider and attempts to get unique identifier from it
func parseResponse(bits []byte, provider string) (string, error) {
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

		if err := json.Unmarshal(bits, &user); err != nil {
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

		if err := json.Unmarshal(bits, &user); err != nil {
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

		if err := json.Unmarshal(bits, &user); err != nil {
			return "", internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrAuthGoogle)
		}

		return user.ID, nil
	default:
		return "", internal.NewErrorf(internal.ErrorCodeInternal, "%v", ErrAuthProfile)
	}
}

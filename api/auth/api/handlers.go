package api

import (
	"net/http"
	"strings"

	"github.com/RagOfJoes/puzzlely/api"
	"github.com/RagOfJoes/puzzlely/auth"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/session"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

func (a *API) auth(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	header := r.Header.Get("Authorization")
	token := strings.TrimPrefix(header, "Bearer ")
	if token == header {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", auth.ErrInvalidAccessToken))
		return
	}

	sess, _ := a.SessionAPI.Session(ctx, w, r, false)
	if sess != nil && sess.IsAuthenticated() {
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeForbidden, "%v", auth.ErrAlreadyAuthenticated))
		return
	} else if sess == nil || sess.IsExpired() {
		newSession := session.New()
		sess = &newSession
	}

	var url, clientID, clientSecret string
	provider := chi.URLParam(r, "provider")
	switch provider {
	case "discord":
		url = a.Config.Providers.Discord.URL
		clientID = a.Config.Providers.Discord.ClientID
		clientSecret = a.Config.Providers.Discord.ClientSecret
	case "github":
		url = a.Config.Providers.GitHub.URL
		clientID = a.Config.Providers.GitHub.ClientID
		clientSecret = a.Config.Providers.GitHub.ClientSecret
	case "google":
		url = a.Config.Providers.Google.URL
		clientID = a.Config.Providers.Google.ClientID
		clientSecret = a.Config.Providers.Google.ClientSecret
	default:
		render.Respond(w, r, internal.NewErrorf(internal.ErrorCodeNotFound, "%s is not a supported provider", provider))
		return
	}

	bits, err := getBits(provider, url, clientID, clientSecret, header)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	profile, err := auth.ProfileFromBits(bits, provider)
	if err != nil {
		render.Respond(w, r, err)
		return
	}

	status := http.StatusOK
	found, _ := a.UserUseCase.FindByConnection(ctx, provider, profile.ID)
	if found == nil {
		newUser := user.NewUser()
		newConnection := user.NewConnection(provider, profile.ID)
		created, err := a.UserUseCase.New(ctx, newUser, newConnection)
		if err != nil {
			render.Respond(w, r, err)
			return
		}
		found = created
		status = http.StatusCreated
	}

	if err := sess.Authenticate(a.Config.Session.Lifetime, *found); err != nil {
		render.Respond(w, r, err)
		return
	}

	if sess, err = a.SessionAPI.Upsert(ctx, w, r, *sess); err != nil {
		render.Respond(w, r, err)
		return
	}
	if err := a.SessionAPI.SetCookie(w, r, *sess); err != nil {
		render.Respond(w, r, err)
		return
	}

	sess.User = found
	if status == http.StatusCreated {
		render.Render(w, r, api.Created("", sess))
		return
	}

	render.Render(w, r, api.Ok("", sess))
}

func (a *API) logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sess, err := a.SessionAPI.Session(ctx, w, r, true)
	if err != nil || sess == nil {
		render.Respond(w, r, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized))
		return
	}

	a.SessionAPI.Destroy(ctx, w, r)

	render.Render(w, r, api.Ok("", nil))
}

package api

import (
	"context"
	"net/http"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/session"
)

func (a *API) SetCookie(w http.ResponseWriter, r *http.Request, value session.Session) error {
	cookie, err := a.Store.Get(r, a.Config.Session.Cookie.Name)
	if err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrFailedStoreGet)
	}

	cookie.Values["session"] = value.Token
	if err := cookie.Save(r, w); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrFailedStoreSave)
	}

	return nil
}

func (a *API) New(ctx context.Context, w http.ResponseWriter, r *http.Request) (*session.Session, error) {
	newSession := session.New()

	created, err := a.UseCase.New(ctx, newSession)
	if err != nil {
		return nil, err
	}

	return created, nil
}

func (a *API) Session(ctx context.Context, w http.ResponseWriter, r *http.Request, mustBeAuthenticated bool) (*session.Session, error) {
	token, err := a.getToken(w, r)
	if err != nil || token == "" {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", session.ErrSessionNotFound)
	}

	found, err := a.UseCase.FindByToken(ctx, token)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", session.ErrSessionNotFound)
	}
	if mustBeAuthenticated && found != nil && !found.IsAuthenticated() {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnauthorized, "%v", session.ErrSessionNotFound)
	}

	return found, nil
}

func (a *API) SessionOrNew(ctx context.Context, w http.ResponseWriter, r *http.Request) (*session.Session, error) {
	found, _ := a.Session(ctx, w, r, false)
	if found != nil {
		return found, nil
	}

	newSession, err := a.New(ctx, w, r)
	if err != nil {
		return nil, err
	}

	return newSession, nil
}

func (a *API) Upsert(ctx context.Context, w http.ResponseWriter, r *http.Request, upsert session.Session) (*session.Session, error) {
	sess, err := a.UseCase.FindByID(ctx, upsert.ID)
	if sess != nil && err != nil {
		upserted, err := a.UseCase.Update(ctx, upsert)
		if err != nil {
			return nil, err
		}
		return upserted, nil
	}

	created, err := a.UseCase.New(ctx, upsert)
	if err != nil {
		return nil, err
	}

	return created, nil
}

func (a *API) Destroy(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	found, err := a.Session(ctx, w, r, false)
	if err != nil {
		return err
	}

	if err := a.UseCase.Destroy(ctx, found.ID); err != nil {
		return err
	}

	cookie, _ := a.Store.Get(r, a.Config.Session.Cookie.Name)
	cookie.Options.MaxAge = -1
	if err := cookie.Save(r, w); err != nil {
		return err
	}

	return nil
}

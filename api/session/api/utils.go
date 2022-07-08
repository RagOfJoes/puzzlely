package api

import (
	"net/http"

	"github.com/RagOfJoes/puzzlely/session"
)

func (a *API) getToken(w http.ResponseWriter, r *http.Request) (string, error) {
	// First check Headers
	if token := r.Header.Get("X-Session-Token"); token != "" {
		return token, nil
	}
	// Then check for cookie
	cookie, err := a.Store.Get(r, a.Config.Session.Cookie.Name)
	// Delete cookie if an error occurred
	if err != nil {
		cookie.Options.MaxAge = -1
		if err := cookie.Save(r, w); err != nil {
			return "", err
		}
		return "", err
	}

	token, ok := cookie.Values["session"].(string)
	if !ok {
		return "", session.ErrInvalidSession
	}
	return token, nil
}

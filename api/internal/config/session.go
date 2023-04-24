package config

import (
	"net/http"
	"time"
)

// Cookie option fields
//
// See: https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Session_Management_Cheat_Sheet.md#cookies
type Cookie struct {
	// Name of the cookie
	//
	// Default: puzzlely_sid
	Name string
	// Path instructs web browsers to only send the cookie to the specified directory or subdirectories (or paths or resources)
	//
	// Default: ""
	Path string
	// Domain instructs web browsers to only send the cookie to the specified domain and all subdomains
	//
	// Default: ""
	Domain string
	// Persist sets whether the session cookie should be retained after User closes their browser
	//
	// Default: true
	Persist bool
	// HttpOnly instructs web browsers not to allow scripts (e.g. JavaScript or VBscript) an ability to access the cookies via the DOM document.cookie object
	//
	// Default: true
	HttpOnly bool
	// SameSite prevents browsers from sending a SameSite flagged cookie with cross-site requests
	//
	// Default: Lax
	SameSite http.SameSite
	// Secrets controls signing keys for cookies
	//
	// The first key in a pair is used for authentication and the second for encryption. The encryption key can be set to nil or omitted in the last pair, but the authentication key is required in all pairs.
	Secrets []string `validate:"required"`
}

// Session config
type Session struct {
	// Lifetime controls how long a session can be valid for
	//
	// Default: 336h (2 weeks)
	Lifetime time.Duration `validate:"required"`
	Cookie   Cookie
}

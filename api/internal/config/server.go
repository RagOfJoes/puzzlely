package config

import (
	"fmt"
	"time"

	"github.com/unrolled/secure"
)

type AccessControl struct {
	AllowCredentials bool
	AllowedOrigins   []string
	AllowHeaders     []string
	AllowMethods     []string
	ExposeHeaders    []string
	RequestHeaders   []string
	RequestMethod    []string
	MaxAge           time.Duration
}

type Server struct {
	// Base configurations
	//

	// Port of the server.
	//
	// Default: 80
	Port int
	// Host of the server.
	//
	// Default: :
	Host string
	// Scheme
	//
	// Default: https
	Scheme string `validate:"oneof='http' 'https'"`
	// URL is the public url which users will use to access API
	//
	// Example: google.com
	URL string `validate:"required"`

	// Route configurations
	//

	// Prefix for the endpoints.
	//
	// Example: v1
	// Default: ""
	Prefix string

	// Middleware configurations
	//

	// Security are the options that controls the security middleware.
	//
	// Default values:
	//  AllowedHosts: []string{}, // AllowedHosts is a list of fully qualified domain names that are allowed. Default is empty list, which allows any and all host names.
	//  AllowedHostsAreRegex: false,  // AllowedHostsAreRegex determines, if the provided AllowedHosts slice contains valid regular expressions. Default is false.
	//  HostsProxyHeaders: []string{"X-Forwarded-Hosts"}, // HostsProxyHeaders is a set of header keys that may hold a proxied hostname value for the request.
	//  SSLRedirect: true, // If SSLRedirect is set to true, then only allow HTTPS requests. Default is false.
	//  SSLTemporaryRedirect: false, // If SSLTemporaryRedirect is true, the a 302 will be used while redirecting. Default is false (301).
	//  SSLHost: "ssl.example.com", // SSLHost is the host name that is used to redirect HTTP requests to HTTPS. Default is "", which indicates to use the same host.
	//  SSLHostFunc: nil, // SSLHostFunc is a function pointer, the return value of the function is the host name that has same functionality as `SSHost`. Default is nil. If SSLHostFunc is nil, the `SSLHost` option will be used.
	//  SSLProxyHeaders: map[string]string{"X-Forwarded-Proto": "https"}, // SSLProxyHeaders is set of header keys with associated values that would indicate a valid HTTPS request. Useful when using Nginx: `map[string]string{"X-Forwarded-Proto": "https"}`. Default is blank map.
	//  STSSeconds: 31536000, // STSSeconds is the max-age of the Strict-Transport-Security header. Default is 0, which would NOT include the header.
	//  STSIncludeSubdomains: true, // If STSIncludeSubdomains is set to true, the `includeSubdomains` will be appended to the Strict-Transport-Security header. Default is false.
	//  STSPreload: true, // If STSPreload is set to true, the `preload` flag will be appended to the Strict-Transport-Security header. Default is false.
	//  ForceSTSHeader: false, // STS header is only included when the connection is HTTPS. If you want to force it to always be added, set to true. `IsDevelopment` still overrides this. Default is false.
	//  FrameDeny: true, // If FrameDeny is set to true, adds the X-Frame-Options header with the value of `DENY`. Default is true.
	//  CustomFrameOptionsValue: "SAMEORIGIN", // CustomFrameOptionsValue allows the X-Frame-Options header value to be set with a custom value. This overrides the FrameDeny option. Default is "".
	//  ContentTypeNosniff: false, // If ContentTypeNosniff is true, adds the X-Content-Type-Options header with the value `nosniff`. Default is false.
	//  BrowserXssFilter: true, // If BrowserXssFilter is true, adds the X-XSS-Protection header with the value `1; mode=block`. Default is false.
	//  CustomBrowserXssValue: "1; report=https://example.com/xss-report", // CustomBrowserXssValue allows the X-XSS-Protection header value to be set with a custom value. This overrides the BrowserXssFilter option. Default is "".
	//  ContentSecurityPolicy: "default-src 'self'", // ContentSecurityPolicy allows the Content-Security-Policy header value to be set with a custom value. Default is "". Passing a template string will replace `$NONCE` with a dynamic nonce value of 16 bytes for each request which can be later retrieved using the Nonce function.
	//  PublicKey: `pin-sha256="base64+primary=="; pin-sha256="base64+backup=="; max-age=5184000; includeSubdomains; report-uri="https://www.example.com/hpkp-report"`, // Deprecated: This feature is no longer recommended. PublicKey implements HPKP to prevent MITM attacks with forged certificates. Default is "".
	//  ReferrerPolicy: "same-origin", // ReferrerPolicy allows the Referrer-Policy header with the value to be set with a custom value. Default is "".
	//  FeaturePolicy: "vibrate 'none';", // Deprecated: this header has been renamed to PermissionsPolicy. FeaturePolicy allows the Feature-Policy header with the value to be set with a custom value. Default is "".
	//  PermissionsPolicy: "fullscreen=(), geolocation=()", // PermissionsPolicy allows the Permissions-Policy header with the value to be set with a custom value. Default is "".
	//  ExpectCTHeader: `enforce, max-age=30, report-uri="https://www.example.com/ct-report"`,
	Security secure.Options
	// AccessControl are the CORS options for the security middleware.
	//
	// Default values:
	//  MaxAge: "12h"
	//  AllowOrigin: "*",
	//  AllowCredentials: true,
	//  AllowMethods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
	//  AllowHeaders: ["X-Session-Token", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin", "Cache-Control", "X-Requested-With"]
	AccessControl AccessControl

	// Misc configurations
	//

	// ExtraSlash appends a slash at the end of the URL if set to true
	//
	// Default: False
	ExtraSlash bool
}

func SetupServer(config *Configuration) error {
	// Setup default values for development
	server := config.Server

	// Security
	security := server.Security
	security.IsDevelopment = true

	server.URL = fmt.Sprintf("%s://%s", server.Scheme, server.URL)
	// Defaults for production
	if config.Environment == Production {
		if server.AccessControl.MaxAge == 0 {
			server.AccessControl.MaxAge = 86400
		}

		// Security header defaults
		security.FrameDeny = true
		security.SSLRedirect = false
		security.IsDevelopment = false
		security.STSSeconds = 315360000
		security.BrowserXssFilter = true
		security.ContentTypeNosniff = true
		security.ReferrerPolicy = "same-origin"
	}

	// Update Server config
	server.Security = security
	config.Server = server

	return nil
}

package config

import (
	"net/http"
	"os"
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

type Environment string

var (
	Development Environment = "Development"
	Production  Environment = "Production"
)

type Configuration struct {
	// Environment
	//
	// Default: Development
	Environment Environment `validate:"required,oneof='Development' 'Production'"`

	// Essentials
	//

	Logger Logger

	Database  Database
	Providers Providers

	Server    Server
	Session   Session
	Telemetry Telemetry
}

func SetBinds(v *viper.Viper) {
	// Environment
	v.BindEnv("Environment", "ENVIRONMENT")
	// Logger
	v.BindEnv("Logger.Level", "LOGGER_LEVEL")
	v.BindEnv("Logger.ReportCaller", "LOGGER_REPORTCALLER")

	// Database
	v.BindEnv("Database.Driver", "DATABASE_DRIVER")
	v.BindEnv("Database.DSN", "DATABASE_DSN")
	// Providers
	v.BindEnv("Providers.Discord.URL", "PROVIDERS_DISCORD_URL")
	v.BindEnv("Providers.Discord.ClientID", "PROVIDERS_DISCORD_CLIENTID")
	v.BindEnv("Providers.Discord.ClientSecret", "PROVIDERS_DISCORD_CLIENTSECRET")
	v.BindEnv("Providers.GitHub.URL", "PROVIDERS_GITHUB_URL")
	v.BindEnv("Providers.GitHub.ClientID", "PROVIDERS_GITHUB_CLIENTID")
	v.BindEnv("Providers.GitHub.ClientSecret", "PROVIDERS_GITHUB_CLIENTSECRET")
	v.BindEnv("Providers.Google.URL", "PROVIDERS_GOOGLE_URL")
	v.BindEnv("Providers.Google.ClientID", "PROVIDERS_GOOGLE_CLIENTID")
	v.BindEnv("Providers.Google.ClientSecret", "PROVIDERS_GOOGLE_CLIENTSECRET")

	// Server
	v.BindEnv("Server.Port", "SERVER_PORT")
	v.BindEnv("Server.Host", "SERVER_HOST")
	v.BindEnv("Server.Scheme", "SERVER_SCHEME")
	v.BindEnv("Server.URL", "SERVER_URL")
	v.BindEnv("Server.Prefix", "SERVER_PREFIX")
	v.BindEnv("Server.Security.BrowserXssFilter", "SERVER_SECURITY_BROWSERXSSFILTER")
	v.BindEnv("Server.Security.ContentTypeNoSniff", "SERVER_SECURITY_CONTENTTYPENOSNIFF")
	v.BindEnv("Server.Security.ForceSTSHeader", "SERVER_SECURITY_FORCESTSHEADER")
	v.BindEnv("Server.Security.FrameDeny", "SERVER_SECURITY_FRAMEDENY")
	v.BindEnv("Server.Security.IsDevelopment", "SERVER_SECURITY_ISDEVELOPMENT")
	v.BindEnv("Server.Security.SSLRedirect", "SERVER_SECURITY_SSLREDIRECT")
	v.BindEnv("Server.Security.SSLForceHost", "SERVER_SECURITY_SSLFORCEHOST")
	v.BindEnv("Server.Security.SSLTemporaryRedirect", "SERVER_SECURITY_SSLTEMPORARYREDIRECT")
	v.BindEnv("Server.Security.STSIncludeSubdomains", "SERVER_SECURITY_STSINCLUDESUBDOMAINS")
	v.BindEnv("Server.Security.STSPreload", "SERVER_SECURITY_STSPRELOAD")
	v.BindEnv("Server.Security.ContentSecurityPolicy", "SERVER_SECURITY_CONTENTSECURITYPOLICY")
	v.BindEnv("Server.Security.ContentSecurityPolicyReportOnly", "SERVER_SECURITY_CONTENTSECURITYPOLICYREPORTONLY")
	v.BindEnv("Server.Security.CustomBrowserXssValue", "SERVER_SECURITY_CUSTOMBROWSERXSSVALUE")
	v.BindEnv("Server.Security.CustomFramerOptionsValue", "SERVER_SECURITY_CUSTOMFRAMEROPTIONSVALUE")
	v.BindEnv("Server.Security.PublicKey", "SERVER_SECURITY_PUBLICKEY")
	v.BindEnv("Server.Security.ReferrerPolicy", "SERVER_SECURITY_REFERRERPOLICY")
	v.BindEnv("Server.Security.FeaturePolicy", "SERVER_SECURITY_FEATUREPOLICY")
	v.BindEnv("Server.Security.PermissionsPolicy", "SERVER_SECURITY_PERMISSIONSPOLICY")
	v.BindEnv("Server.Security.CrossOriginOpenerPolicy", "SERVER_SECURITY_CROSSORIGINOPENERPOLICY")
	v.BindEnv("Server.Security.SSLHost", "SERVER_SECURITY_SSLHOST")
	v.BindEnv("Server.Security.AllowedHosts", "SERVER_SECURITY_ALLOWEDHOSTS")
	v.BindEnv("Server.Security.AllowedHostsAreRegex", "SERVER_SECURITY_ALLOWEDHOSTSAREREGEX")
	v.BindEnv("Server.Security.HostsProxyHeaders", "SERVER_SECURITY_HOSTSPROXYHEADERS")
	v.BindEnv("Server.Security.SSLHostFunc", "SERVER_SECURITY_SSLHOSTFUNC")
	v.BindEnv("Server.Security.SSLProxyHeaders", "SERVER_SECURITY_SSLPROXYHEADERS")
	v.BindEnv("Server.Security.STSSeconds", "SERVER_SECURITY_STSSECONDS")
	v.BindEnv("Server.Security.ExpectCTHeader", "SERVER_SECURITY_EXPECTCTHEADER")
	v.BindEnv("Server.Security.SecureContextKey", "SERVER_SECURITY_SECURECONTEXTKEY")
	v.BindEnv("Server.AccessControl.AllowCredentials", "SERVER_ACCESSCONTROL_ALLOWCREDENTIALS")
	v.BindEnv("Server.AccessControl.AllowedOrigins", "SERVER_ACCESSCONTROL_ALLOWEDORIGINS")
	v.BindEnv("Server.AccessControl.AllowHeaders", "SERVER_ACCESSCONTROL_ALLOWHEADERS")
	v.BindEnv("Server.AccessControl.AllowMethods", "SERVER_ACCESSCONTROL_ALLOWMETHODS")
	v.BindEnv("Server.AccessControl.ExposeHeaders", "SERVER_ACCESSCONTROL_EXPOSEHEADERS")
	v.BindEnv("Server.AccessControl.RequestHeaders", "SERVER_ACCESSCONTROL_REQUESTHEADERS")
	v.BindEnv("Server.AccessControl.RequestMethod", "SERVER_ACCESSCONTROL_REQUESTMETHOD")
	v.BindEnv("Server.AccessControl.MaxAge", "SERVER_ACCESSCONTROL_MAXAGE")
	v.BindEnv("Server.ExtraSlash", "SERVER_EXTRASLASH")
	// Session
	v.BindEnv("Session.Lifetime", "SESSION_LIFETIME")
	v.BindEnv("Session.Cookie.Name", "SESSION_COOKIE_NAME")
	v.BindEnv("Session.Cookie.Path", "SESSION_COOKIE_PATH")
	v.BindEnv("Session.Cookie.Domain", "SESSION_COOKIE_DOMAIN")
	v.BindEnv("Session.Cookie.Persist", "SESSION_COOKIE_PERSIST")
	v.BindEnv("Session.Cookie.HttpOnly", "SESSION_COOKIE_HTTPONLY")
	v.BindEnv("Session.Cookie.SameSite", "SESSION_COOKIE_SAMESITE")
	v.BindEnv("Session.Cookie.Secrets", "SESSION_COOKIE_SECRETS")
	// Telemetry
	v.BindEnv("Telemetry.APIKey", "TELEMETRY_APIKEY")
	v.BindEnv("Telemetry.ServiceName", "TELEMETRY_SERVICENAME")
}

func SetDefaults(v *viper.Viper) {
	// Environment
	v.SetDefault("ENVIRONMENT", "Production")
	// Logger
	v.SetDefault("LOGGER_LEVEL", int(logrus.InfoLevel))
	v.SetDefault("LOGGER_REPORTCALLER", false)

	// Server
	v.SetDefault("SERVER_PORT", 443)
	v.SetDefault("SERVER_HOST", "api.puzzlely.io")
	v.SetDefault("SERVER_SCHEME", "https")
	v.SetDefault("SERVER_ACCESSCONTROL_MAXAGE", 86400)
	v.SetDefault("SERVER_ACCESSCONTROL_ALLOWCREDENTIALS", true)
	v.SetDefault("SERVER_ACCESSCONTROL_ALLOWEDORIGINS", []string{"https://puzzlely.io"})
	v.SetDefault("SERVER_ACCESSCONTROL_EXPOSEDHEADERS", []string{})
	v.SetDefault("SERVER_ACCESSCONTROL_ALLOWMETHODS", []string{"GET", "PUT", "POST", "DELETE", "OPTIONS"})
	v.SetDefault("SERVER_ACCESSCONTROL_ALLOWHEADERS", []string{"Content-Type", "Content-Length", "Authorization", "Accept", "Origin", "Cache-Control", "Set-Cookie", "X-Requested-With"})
	v.SetDefault("SERVER_SECURITY_ISDEVELOPMENT", false)
	v.SetDefault("SERVER_SECURITY_REFERRERPOLICY", "same-origin")
	v.SetDefault("SERVER_SECURITY_HOSTSPROXYHEADERS", []string{"X-Forwarded-Hosts"})
	// Session
	v.SetDefault("SESSION_LIFETIME", time.Hour*336)
	v.SetDefault("SESSION_COOKIE_PATH", "/")
	v.SetDefault("SESSION_COOKIE_PERSIST", true)
	v.SetDefault("SESSION_COOKIE_HTTP_ONLY", true)
	v.SetDefault("SESSION_COOKIE_NAME", "puzzlely_sid")
	v.SetDefault("SESSION_COOKIE_SAMESITE", http.SameSiteLaxMode)
}

func New(v *viper.Viper, logger *logrus.Logger) (*Configuration, error) {
	SetBinds(v)
	SetDefaults(v)

	v.SetConfigName("puzzlely")
	v.AutomaticEnv()

	dir := os.Getenv("XDG_CONFIG_HOME")
	if dir == "" {
		dir = "$HOME/.config"
	}
	v.AddConfigPath(dir + "/puzzlely/")
	v.AddConfigPath("/etc/puzzlely/")
	v.AddConfigPath(".")
	if err := v.ReadInConfig(); err != nil {
		return nil, err
	}

	config := Configuration{}
	if err := v.Unmarshal(&config); err != nil {
		return nil, err
	}
	if err := validate.Check(config); err != nil {
		return nil, err
	}

	if err := SetupServer(&config); err != nil {
		return nil, err
	}
	if err := SetupLogger(config, logger); err != nil {
		return nil, err
	}

	return &config, nil
}

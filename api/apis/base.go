package apis

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"github.com/riandyrn/otelchi"
	"github.com/sirupsen/logrus"
	"github.com/unrolled/secure"
)

// Context keys that will be used by middlewares and handlers
var (
	ContextUserKey string = "user"
)

// Common errors
var (
	ErrUnauthorized = errors.New("You must be logged in to access this resource.")
)

func New(cfg config.Configuration) *chi.Mux {
	router := chi.NewRouter()

	// Default Middlewares
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(render.SetContentType(render.ContentTypeJSON))
	router.Use(Logger)
	router.Use(secure.New(cfg.Server.Security).Handler)
	router.Use(cors.Handler(cors.Options{
		AllowCredentials: cfg.Server.AccessControl.AllowCredentials,
		AllowedHeaders:   cfg.Server.AccessControl.AllowHeaders,
		AllowedMethods:   cfg.Server.AccessControl.AllowMethods,
		AllowedOrigins:   cfg.Server.AccessControl.AllowedOrigins,
		ExposedHeaders:   cfg.Server.AccessControl.ExposeHeaders,
		MaxAge:           int(cfg.Server.AccessControl.MaxAge),
	}))
	router.Use(middleware.StripSlashes)
	router.Use(middleware.Recoverer)
	// Opentelemetry middleware
	// Traces incoming requests
	router.Use(otelchi.Middleware(cfg.Telemetry.ServiceName, otelchi.WithChiRoutes(router)))

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	router.Use(middleware.Timeout(60 * time.Second))

	// Custom MethodNotAllowed handler
	router.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		render.Render(w, r, MethodNotAllowed(internal.NewErrorf(internal.ErrorCodeMethodNotAllowed, "Server knows the request method, but the target doesn't support this method.")))
	})
	// Custom NotFound handler
	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		render.Render(w, r, NotFound(internal.NewErrorf(internal.ErrorCodeNotFound, "Hmmm... Seems you're a bit lost.")))
	})
	// Custom DefaultResponder
	render.Respond = func(w http.ResponseWriter, r *http.Request, v any) {
		if e, ok := v.(error); ok {
			internalErr := InternalServerError(internal.WrapErrorf(e, internal.ErrorCodeInternal, "Oops! Something went wrong. Please try again later."))

			var err *internal.Error
			if errors.As(e, &err) {
				logrus.Debugf("Actual error: %+v", errors.Unwrap(err))

				switch err.Code {
				case internal.ErrorCodeBadRequest:
					render.Render(w, r, BadRequest(err))
				case internal.ErrorCodeUnauthorized:
					render.Render(w, r, Unauthorized(err))
				case internal.ErrorCodeForbidden:
					render.Render(w, r, Forbidden(err))
				case internal.ErrorCodeNotFound:
					render.Render(w, r, NotFound(err))
				case internal.ErrorCodeMethodNotAllowed:
					render.Render(w, r, MethodNotAllowed(err))
				default:
					render.Render(w, r, internalErr)
				}
				return
			}

			render.Render(w, r, internalErr)
			return
		}

		render.DefaultResponder(w, r, v)
	}

	logrus.Infof("Created HTTP Server with %d middleware(s)", len(router.Middlewares()))

	return router
}

func Run(cfg config.Configuration, handler http.Handler) error {
	addr := resolveAddr(cfg.Server.Host, cfg.Server.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: handler,
	}

	// Setup graceful shutdown handling
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	// Initializing the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		logrus.Infof("HTTP Server now running on %s\n\n", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("HTTP Server failed to run: %s", err)
		}
	}()

	// Listen for the interrupt signal.
	<-ctx.Done()

	// Restore default behavior on the interrupt signal and notify user of shutdown.
	stop()
	logrus.Info("Shutting down gracefully, press Ctrl+C again to force")

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		return err
	}

	logrus.Info("Server exiting")
	return nil
}

func resolveAddr(host string, port int) string {
	if port == 80 {
		return host
	}
	if host == ":" {
		return fmt.Sprintf("%s%d", host, port)
	}
	return fmt.Sprintf("%s:%d", host, port)
}

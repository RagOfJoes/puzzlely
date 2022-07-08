package api

import (
	"context"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
	"github.com/unrolled/secure"
)

func New(cfg config.Configuration, logger *logrus.Logger) *chi.Mux {
	router := chi.NewRouter()

	// Middlewares
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

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	router.Use(middleware.Timeout(60 * time.Second))

	// Setup custom error handlers
	router.MethodNotAllowed(methodNotAllowed)
	router.NotFound(notFound)

	logrus.Infof("Created HTTP Server with %d middleware(s)", len(router.Middlewares()))
	render.Respond = respond

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

package telemetry

import (
	"context"

	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"

	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
)

const (
	apiKeyHeader     = "X-HONEYCOMB-TEAM"
	exporterEndpoint = "api.honeycomb.io:443"
)

// Start configures and starts OpenTelemetry
func Start(cfg config.Configuration) (func(), error) {
	logrus.Info("Starting telemetry...")

	ctx := context.Background()

	// Configure a new OTLP exporter using environment variables for sending data to Honeycomb over gRPC
	client := otlptracegrpc.NewClient(
		otlptracegrpc.WithEndpoint(exporterEndpoint),
		otlptracegrpc.WithHeaders(map[string]string{
			apiKeyHeader: cfg.Telemetry.APIKey,
		}),
	)

	// Configure exporter then start it
	exporter, err := otlptrace.New(ctx, client)
	if err != nil {
		logrus.Errorf("Failed to setup telemetry: %s", err)

		return nil, err
	}

	// Create a new tracer provider with a batch span processor and the otlp exporter
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(
			resource.NewWithAttributes(
				semconv.SchemaURL,
				semconv.HTTPHostKey.String(cfg.Server.Host),
				semconv.ServiceNameKey.String(cfg.Telemetry.ServiceName),
			),
		),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
	)

	// Register the global Tracer provider
	otel.SetTracerProvider(tracerProvider)

	// Register the W3C trace context and baggage propagators so data is propagated across services/processes
	otel.SetTextMapPropagator(
		propagation.NewCompositeTextMapPropagator(
			propagation.TraceContext{},
			propagation.Baggage{},
		),
	)

	// Handles shutdown to ensure all sub processes are closed correctly and telemetry is exported
	shutdown := func() {
		_ = exporter.Shutdown(ctx)
		_ = tracerProvider.Shutdown(ctx)
	}

	logrus.Info("Successfully started telemetry\n\n")

	return shutdown, nil
}

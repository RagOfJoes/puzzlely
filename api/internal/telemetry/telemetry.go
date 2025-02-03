package telemetry

import (
	"context"
	"crypto/tls"
	"fmt"

	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

const (
	exporterEndpoint = "api.axiom.co"
)

// Start configures and starts OpenTelemetry
func Start(cfg config.Configuration) (func(context.Context) error, error) {
	logrus.Info("Starting telemetry...")

	ctx := context.Background()

	dataset := "dev"
	if cfg.Environment == config.Production {
		dataset = "production"
	}

	// Sets up OTLP HTTP exporter with endpoint, headers, and TLS config.
	exporter, err := otlptracehttp.New(ctx,
		otlptracehttp.WithEndpoint(exporterEndpoint),
		otlptracehttp.WithHeaders(map[string]string{
			"Authorization":   fmt.Sprintf("Bearer %s", cfg.Telemetry.APIKey),
			"X-Axiom-Dataset": dataset,
		}),
		otlptracehttp.WithTLSClientConfig(&tls.Config{}),
	)
	if err != nil {
		logrus.Errorf("Failed to setup telemetry: %s", err)

		return nil, err
	}

	// Create a new tracer provider with a batch span processor and the otlp exporter
	tracerProvider := trace.NewTracerProvider(
		trace.WithBatcher(exporter),
		trace.WithResource(
			resource.NewWithAttributes(
				semconv.SchemaURL,
				semconv.ServiceNameKey.String(cfg.Telemetry.ServiceName),
				semconv.ServiceVersionKey.String(cfg.Version),
				attribute.String("environment", cfg.Environment.String()),
			),
		),
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

	return tracerProvider.Shutdown, nil
}

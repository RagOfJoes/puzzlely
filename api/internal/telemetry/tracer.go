package telemetry

import (
	"context"
	"fmt"

	"go.opentelemetry.io/contrib"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

// Custom tracer that allows proper prefixing of spans
type tracer struct {
	name   string
	tracer trace.Tracer
}

// Tracer creates a named tracer that prefixes spans with given name
func Tracer(name string) trace.Tracer {
	return tracer{
		name: name,
		tracer: otel.Tracer(
			name,
			trace.WithInstrumentationVersion(contrib.SemVersion()),
		),
	}
}

// Start creates and starts span
func (t tracer) Start(ctx context.Context, spanName string, opts ...trace.SpanStartOption) (context.Context, trace.Span) {
	return t.tracer.Start(ctx, fmt.Sprintf("%s/%s", t.name, spanName), opts...)
}

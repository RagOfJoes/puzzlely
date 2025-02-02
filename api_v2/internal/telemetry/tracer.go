package telemetry

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

var _ trace.Tracer = (*tracer)(nil)

// Custom tracer that allows proper prefixing of spans
type tracer struct {
	trace.Tracer

	name string
}

// Tracer creates a named tracer that prefixes spans with given name
func Tracer(name string) trace.Tracer {
	return &tracer{
		Tracer: otel.Tracer(name),

		name: name,
	}
}

// Start creates and starts span
func (t tracer) Start(ctx context.Context, spanName string, opts ...trace.SpanStartOption) (context.Context, trace.Span) {
	return t.Tracer.Start(ctx, fmt.Sprintf("%s/%s", t.name, spanName), opts...)
}

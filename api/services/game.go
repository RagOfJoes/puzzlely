package services

import (
	"context"
	"errors"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/telemetry"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

// Errors
var (
	ErrGameFailedCreate = errors.New("Failed to create a new game.")
	ErrGameHistory      = errors.New("Failed to get game history.")
	ErrGameNotFound     = errors.New("Game not found.")
)

type Game struct {
	tracer trace.Tracer

	repository repositories.Game
}

type GameDependencies struct {
	Repository repositories.Game
}

func NewGame(d GameDependencies) Game {
	logrus.Print("Created Game Service")

	return Game{
		tracer: telemetry.Tracer("services.game"),

		repository: d.Repository,
	}
}

func (g *Game) FindByPuzzleID(ctx context.Context, id ulid.ULID) (*domains.Game, error) {
	ctx, span := g.tracer.Start(ctx, "FindByPuzzleID", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	game, err := g.repository.GetWithPuzzleID(ctx, id.String())
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}
	if err := game.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrGameNotFound)
	}

	return game, nil
}

func (g *Game) FindHistory(ctx context.Context, id string, opts domains.GameCursorPaginationOpts) (*domains.GameSummaryConnection, error) {
	ctx, span := g.tracer.Start(ctx, "FindHistory", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	if err := opts.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrGameHistory)
	}

	games, err := g.repository.GetHistory(ctx, id, opts)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameHistory)
	}

	// Validate results
	for i := range games {
		game := &games[i]
		game.Attempts = game.Attempts - int16(game.Score)

		if err := game.Validate(); err != nil {
			span.SetStatus(codes.Error, "")
			span.RecordError(err)

			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrGameHistory)
		}
	}

	connection, err := domains.BuildGameSummaryConnection(games, opts.Limit)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrPuzzleLiked)
	}

	return connection, nil
}

func (g *Game) Save(ctx context.Context, payload domains.Game) (*domains.Game, error) {
	ctx, span := g.tracer.Start(ctx, "Save", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	if err := payload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	game, err := g.repository.Save(ctx, payload)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	return game, nil
}

package services

import (
	"context"
	"errors"
	"time"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

// Errors
var (
	ErrUserCreate          = errors.New("Failed to create user.")
	ErrUserDelete          = errors.New("Failed to delete user.")
	ErrUserDoesNotExist    = errors.New("User does not exist.")
	ErrUserInvalid         = errors.New("Invalid user.")
	ErrUserInvalidUsername = errors.New("Username is not available.")
	ErrUserUpdate          = errors.New("Failed to update user.")
)

// User defines the user service
type User struct {
	tracer trace.Tracer

	repository repositories.User
}

type UserDependencies struct {
	Repository repositories.User
}

// NewUser instantiates a user service
func NewUser(dependencies UserDependencies) User {
	logrus.Print("Created User Service")

	return User{
		tracer: otel.Tracer("services.user"),

		repository: dependencies.Repository,
	}
}

// New creates a new user given a valid connection and a valid user entity
func (u *User) New(ctx context.Context, connectionPayload domains.Connection, userPayload domains.User) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "New", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	if err := connectionPayload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := userPayload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	user, err := u.repository.Create(ctx, connectionPayload, userPayload)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserCreate)
	}

	return user, nil
}

// Find retrieves a user with their id. If strict is set to true then only completed users will be returned
func (u *User) Find(ctx context.Context, id string, strict bool) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "Find", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	user, err := u.repository.Get(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}
	if err := user.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	return user, nil
}

// FindWithConnection retrieves a user with one of their connection
func (u *User) FindWithConnection(ctx context.Context, payload domains.Connection) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "FindWithConnection", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	user, err := u.repository.GetWithConnection(ctx, payload)
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}
	if err := user.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	return user, nil
}

// Update updates a user
func (u *User) Update(ctx context.Context, payload domains.User) (*domains.User, error) {
	ctx, span := u.tracer.Start(ctx, "Update", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	session := domains.SessionFromContext(ctx)

	if err := payload.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	// Make sure only certain fields are updated
	payload.ID = session.User.ID
	payload.State = session.User.State
	payload.CreatedAt = session.User.CreatedAt
	payload.UpdatedAt = bun.NullTime{
		Time: time.Now(),
	}

	if session.User.State != "COMPLETE" || session.User.UpdatedAt.IsZero() {
		payload.State = "COMPLETE"
	}

	user, err := u.repository.Update(ctx, payload)
	if err != nil && errors.Is(err, repositories.ErrUserUsernameNotAvailable) {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrUserInvalidUsername)
	} else if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrUserUpdate)
	}

	if err := user.Validate(); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserUpdate)
	}

	return user, nil
}

// Delete deletes a user
func (u *User) Delete(ctx context.Context, id string) error {
	ctx, span := u.tracer.Start(ctx, "Delete", trace.WithSpanKind(trace.SpanKindInternal))
	defer span.End()

	if err := u.repository.Delete(ctx, id); err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)

		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserDelete)
	}

	return nil
}

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
)

// Errors
var (
	ErrUserCreate          = errors.New("Failed to create user.")
	ErrUserDelete          = errors.New("Failed to delete user.")
	ErrUserDoesNotExist    = errors.New("User does not exist.")
	ErrUserInvalid         = errors.New("Invalid user.")
	ErrUserInvalidUsername = errors.New("Username is not available")
	ErrUserUpdate          = errors.New("Failed to update user.")
)

// User defines the user service
type User struct {
	repository repositories.User
}

type UserDependencies struct {
	Repository repositories.User
}

// NewUser instantiates a user service
func NewUser(dependencies UserDependencies) User {
	logrus.Print("Created User Service")

	return User{
		repository: dependencies.Repository,
	}
}

// New creates a new user given a valid connection and a valid user entity
func (u *User) New(ctx context.Context, newConnection domains.Connection, newUser domains.User) (*domains.User, error) {
	if err := newConnection.Validate(); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := newUser.Validate(); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	created, err := u.repository.Create(ctx, newConnection, newUser)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserCreate)
	}

	return created, nil
}

// Find retrieves a user with their id. If strict is set to true then only completed users will be returned
func (u *User) Find(ctx context.Context, id string, strict bool) (*domains.User, error) {
	foundUser, err := u.repository.Get(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}
	if err := foundUser.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	return foundUser, nil
}

// FindWithConnection retrieves a user with one of their connection
func (u *User) FindWithConnection(ctx context.Context, connection domains.Connection) (*domains.User, error) {
	foundUser, err := u.repository.GetWithConnection(ctx, connection)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}
	if err := foundUser.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	return foundUser, nil
}

// Update updates a user
func (u *User) Update(ctx context.Context, update domains.User) (*domains.User, error) {
	session := domains.SessionFromContext(ctx)

	if err := update.Validate(); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	// Make sure only certain fields are updated
	update.ID = session.User.ID
	update.State = session.User.State
	update.CreatedAt = session.User.CreatedAt
	update.UpdatedAt = bun.NullTime{
		Time: time.Now(),
	}

	if session.User.State != "COMPLETE" || session.User.UpdatedAt.IsZero() {
		update.State = "COMPLETE"
	}

	user, err := u.repository.Update(ctx, update)
	if err != nil && errors.Is(err, repositories.ErrUserUsernameNotAvailable) {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrUserInvalidUsername)
	} else if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrUserUpdate)
	}

	if err := user.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserUpdate)
	}

	return user, nil
}

// Delete deletes a user
func (u *User) Delete(ctx context.Context, id string) error {
	if err := u.repository.Delete(ctx, id); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserDelete)
	}

	return nil
}

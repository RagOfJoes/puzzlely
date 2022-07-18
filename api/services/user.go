package services

import (
	"context"
	"errors"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/google/uuid"
)

// Errors
var (
	ErrUserDelete       = errors.New("Failed to delete user.")
	ErrUserNew          = errors.New("Failed to create user.")
	ErrUserUpdate       = errors.New("Failed to update user.")
	ErrUserDoesNotExist = errors.New("User does not exist.")
)

// User defines the user service
type User struct {
	config     config.Configuration
	repository repositories.User
}

// NewUser instantiates a user service
func NewUser(config config.Configuration, repository repositories.User) User {
	return User{
		config:     config,
		repository: repository,
	}
}

// New creates a new user given a valid connection and a valid user entity
func (u *User) New(ctx context.Context, newConnection entities.Connection, newUser entities.User) (*entities.User, error) {
	if err := validate.Check(newUser); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := validate.Check(newConnection); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	user, err := u.repository.Create(ctx, newConnection, newUser)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserNew)
	}

	return user, nil
}

// Find retrieves a user with their id or username. If strict is set to true then only completed users will be returned
func (u *User) Find(ctx context.Context, search string, strict bool) (*entities.User, error) {
	_, uuidErr := uuid.Parse(search)
	usernameErr := validate.Var(search, "required,notblank,alphanum,min=4,max=24")
	if uuidErr != nil && usernameErr != nil {
		err := uuidErr
		if uuidErr == nil {
			err = usernameErr
		}
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	user, err := u.repository.Get(ctx, search)
	if err != nil {
		return nil, err
	}
	if err := user.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}
	if strict && !user.IsComplete() {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	return user, nil
}

// FindWithConnection retrieves a user with one of their connection
func (u *User) FindWithConnection(ctx context.Context, provider, sub string) (*entities.User, error) {
	user, err := u.repository.GetWithConnection(ctx, provider, sub)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}
	if err := user.Validate(); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	return user, nil
}

// FindStats retrieves a user's stats given their id
func (u *User) FindStats(ctx context.Context, id uuid.UUID) (*entities.Stats, error) {
	stats, err := u.repository.GetStats(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", ErrUserDoesNotExist)
	}

	return stats, nil
}

// Update updates a user
func (u *User) Update(ctx context.Context, update entities.User) (*entities.User, error) {
	if err := update.Validate(); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	if !update.IsComplete() {
		update.Complete()
	}

	user, err := u.repository.Update(ctx, update)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", ErrUserUpdate)
	}

	return user, nil
}

// Delete deletes a user
func (u *User) Delete(ctx context.Context, id uuid.UUID) error {
	if err := u.repository.Delete(ctx, id); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrUserDelete)
	}

	return nil
}

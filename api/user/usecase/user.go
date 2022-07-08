package usecase

import (
	"context"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

func (s *Service) New(ctx context.Context, newUser user.User, newConnection user.Connection) (*user.User, error) {
	if err := validate.Check(newUser); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := validate.Check(newConnection); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	created, err := s.Repository.Create(ctx, newUser, newConnection)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", user.ErrFailedCreate)
	}
	if err := validate.Check(created); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrFailedCreate)
	}

	return created, nil
}

func (s *Service) Find(ctx context.Context, search string, strict bool) (*user.User, error) {
	_, uuidErr := uuid.Parse(search)
	usernameErr := validate.Var(search, "required,notblank,alphanum,min=4,max=24")
	if uuidErr != nil && usernameErr != nil {
		if uuidErr != nil {
			return nil, internal.WrapErrorf(uuidErr, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
		}
		return nil, internal.WrapErrorf(usernameErr, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
	}

	found, err := s.Repository.Get(ctx, search)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
	}
	if err := validate.Check(found); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
	}
	if strict && found.State != user.Complete {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
	}

	return found, nil
}

func (s *Service) FindByConnection(ctx context.Context, provider, sub string) (*user.User, error) {
	found, err := s.Repository.GetWithConnection(ctx, provider, sub)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
	}
	if err := validate.Check(found); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
	}

	return found, nil
}

func (s *Service) FindStats(ctx context.Context, id uuid.UUID) (*user.Stats, error) {
	stats, err := s.Repository.GetStats(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", user.ErrDoesNotExist)
	}

	return stats, nil
}

func (s *Service) Update(ctx context.Context, update user.User) (*user.User, error) {
	if err := validate.Var(update.ID, "required"); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "id%v", err)
	}
	if err := validate.Var(update.Username, "required,notblank,alphanum,min=4,max=24"); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "username%v", err)
	}

	now := time.Now()
	update.UpdatedAt = &now
	if update.State == user.Pending {
		update.State = user.Complete
	}
	if err := validate.Check(update); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	updated, err := s.Repository.Update(ctx, update)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", user.ErrInvalidUsername)
	}
	return updated, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.Repository.Delete(ctx, id); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", user.ErrFailedDelete)
	}

	return nil
}

package usecase

import (
	"context"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/session"
	"github.com/google/uuid"
)

func (s *Service) New(ctx context.Context, newSession session.Session) (*session.Session, error) {
	if err := validate.Check(newSession); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrInvalidSession)
	}
	created, err := s.Repository.Create(ctx, newSession)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrFailedCreate)
	}

	return created, nil
}

func (s *Service) FindByID(ctx context.Context, id uuid.UUID) (*session.Session, error) {
	found, err := s.Repository.Get(ctx, id)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrInvalidSessionID)
	}
	if err := found.IsValid(); err != nil {
		return nil, err
	}
	strip(found)

	return found, nil
}

func (s *Service) FindByToken(ctx context.Context, token string) (*session.Session, error) {
	found, err := s.Repository.GetWithToken(ctx, token)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrInvalidSessionToken)
	}
	if err := found.IsValid(); err != nil {
		return nil, err
	}
	strip(found)

	return found, nil
}

func (s *Service) Update(ctx context.Context, updateSession session.Session) (*session.Session, error) {
	if err := validate.Check(updateSession); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrInvalidSession)
	}
	updated, err := s.Repository.Update(ctx, updateSession)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrFailedUpdate)
	}
	strip(updated)

	return updated, nil
}

func (s *Service) Destroy(ctx context.Context, id uuid.UUID) error {
	err := s.Repository.Delete(ctx, id)
	if err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", session.ErrFailedDelete)
	}

	return nil
}

func strip(s *session.Session) {
	// Just incase Identity was left over, make sure to remove it before sending back to client
	if s.State == session.Unauthenticated {
		s.User = nil
	}
}

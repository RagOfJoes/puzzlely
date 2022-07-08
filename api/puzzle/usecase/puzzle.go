package usecase

import (
	"context"
	"time"

	"github.com/RagOfJoes/puzzlely/auth"
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

var (
	sortKeyMap = map[string]string{
		"createdAt":  "created_at",
		"created_at": "created_at",
		"likedAt":    "updated_at",
		"liked_at":   "updated_at",
	}
)

func (s *Service) New(ctx context.Context, newPuzzle puzzle.Puzzle) (*puzzle.Puzzle, error) {
	if err := validate.Check(newPuzzle); err != nil {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}

	created, err := s.Repository.Create(ctx, newPuzzle)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrFailedCreate)
	}

	created.CreatedBy = newPuzzle.CreatedBy
	if err := validate.Check(created); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedCreate)
	}
	return created, nil
}

func (s *Service) Find(ctx context.Context, strict bool, value string, currentUser *user.User) (*puzzle.Puzzle, error) {
	if strict && currentUser == nil {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", puzzle.ErrNotAuthorized)
	}

	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	retrieved, err := s.Repository.Get(ctx, value, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", puzzle.ErrNotFound)
	}
	if err := validate.Check(retrieved); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", puzzle.ErrNotFound)
	}
	if strict && currentUser != nil && retrieved.CreatedBy.ID != currentUser.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", puzzle.ErrNotAuthorized)
	}

	return retrieved, nil
}

func (s *Service) FindCreated(ctx context.Context, params pagination.Params, user user.User, currentUser *user.User) (*puzzle.Connection, error) {
	if err := params.Validate(sortKeyMap); err != nil {
		return nil, err
	}
	params.Limit = params.Limit + 1

	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	list, err := s.Repository.GetCreated(ctx, params, user.ID, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
	}

	connection, err := buildConnection(list, params.Limit, params.SortKey)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

func (s *Service) FindLiked(ctx context.Context, params pagination.Params, currentUser user.User) (*puzzle.Connection, error) {
	if err := params.Validate(sortKeyMap); err != nil {
		return nil, err
	}
	params.Limit = params.Limit + 1

	list, err := s.Repository.GetLiked(ctx, params, currentUser.ID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
	}

	connection, err := buildConnection(list, params.Limit, "LikedAt")
	if err != nil {
		return nil, err
	}

	return connection, nil
}

func (s *Service) FindMostLiked(ctx context.Context, currentUser *user.User) (*puzzle.Connection, error) {
	params := pagination.Params{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	list, err := s.Repository.GetMostLiked(ctx, params, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
	}

	connection, err := buildConnection(list, params.Limit, params.SortKey)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

func (s *Service) FindMostPlayed(ctx context.Context, currentUser *user.User) (*puzzle.Connection, error) {
	params := pagination.Params{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	list, err := s.Repository.GetMostPlayed(ctx, params, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
	}

	connection, err := buildConnection(list, params.Limit, params.SortKey)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

func (s *Service) FindRecent(ctx context.Context, params pagination.Params, filters puzzle.Filters, currentUser *user.User) (*puzzle.Connection, error) {
	// Validate pagination params
	if err := params.Validate(sortKeyMap); err != nil {
		return nil, err
	}
	params.Limit = params.Limit + 1

	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	list, err := s.Repository.GetRecent(ctx, params, filters, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
	}

	connection, err := buildConnection(list, params.Limit, params.SortKey)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

func (s *Service) Search(ctx context.Context, search string, currentUser *user.User) (*puzzle.Connection, error) {
	params := pagination.Params{
		Cursor:    "",
		Limit:     100,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	var currentUserID *uuid.UUID
	if currentUser != nil {
		currentUserID = &currentUser.ID
	}

	list, err := s.Repository.Search(ctx, params, search, currentUserID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
	}

	connection, err := buildConnection(list, params.Limit, params.SortKey)
	if err != nil {
		return nil, err
	}

	return connection, nil
}

func (s *Service) ToggleLike(ctx context.Context, id uuid.UUID, currentUser user.User) (*puzzle.Like, error) {
	found, err := s.Find(ctx, false, id.String(), &currentUser)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "%v", puzzle.ErrNotFound)
	}

	toggled, err := s.Repository.ToggleLike(ctx, found.ID, currentUser.ID)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedLike)
	}

	return toggled, nil
}

func (s *Service) Update(ctx context.Context, old, update puzzle.Puzzle, currentUser user.User) (*puzzle.Puzzle, error) {
	if old.ID != update.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalid)
	}
	if old.CreatedBy.ID != update.CreatedBy.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalid)
	}
	if old.CreatedBy.ID != currentUser.ID {
		return nil, internal.NewErrorf(internal.ErrorCodeUnauthorized, "%v", auth.ErrUnauthorized)
	}

	if err := validate.Check(old); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalid)
	}
	if err := validate.Check(update); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", puzzle.ErrInvalid)
	}

	// Ensure that no values outside of Name, Description, and, Group Description are changed
	update.ID = old.ID
	update.MaxAttempts = old.MaxAttempts
	update.TimeAllowed = old.TimeAllowed
	update.CreatedAt = old.CreatedAt
	update.CreatedBy = old.CreatedBy

	groups := []puzzle.Group{}
	for idx, group := range old.Groups {
		updated := update.Groups[idx]
		updated.ID = group.ID
		updated.Answers = group.Answers
		updated.Blocks = group.Blocks

		groups = append(groups, updated)
	}
	update.Groups = groups

	// Update UpdatedAt value
	now := time.Now()
	update.UpdatedAt = &now

	updated, err := s.Repository.Update(ctx, update)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedUpdate)
	}

	return updated, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, currentUser user.User) error {
	if err := s.Repository.Delete(ctx, id, currentUser.ID); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedDelete)
	}

	return nil
}

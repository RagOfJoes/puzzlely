package services_test

import (
	"context"
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/google/uuid"
	"github.com/rs/xid"
	"github.com/stretchr/testify/assert"
)

func TestNewSession(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.Session{}

	service := services.NewSession(cfg, repository)

	assert.NotZero(t, service)
}

func TestSessionNew(t *testing.T) {
	repository, service := testutils.SetupSessionService()

	unauthenticated := entities.NewSession()

	authenticated := entities.NewSession()
	authenticated.Authenticate(5*time.Minute, entities.NewUser())

	tests := []struct {
		input    entities.Session
		expected *entities.Session
	}{
		{
			input:    entities.Session{},
			expected: nil,
		},
		{
			input:    unauthenticated,
			expected: &unauthenticated,
		},
		{
			input:    authenticated,
			expected: &authenticated,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = services.ErrSessionCreate
		}

		repository.EXPECT().
			Create(ctx, test.input).
			Return(test.expected, err)

		session, err := service.New(ctx, test.input)
		if test.expected == nil {
			assert.Nil(t, session)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, session)
			assert.NoError(t, err)
		}
	}
}

func TestSessionFindByID(t *testing.T) {
	repository, service := testutils.SetupSessionService()

	user := entities.NewUser()
	unauthenticated := entities.NewSession()
	unauthenticated.User = &user
	strippedUnauthenticated := unauthenticated
	strippedUnauthenticated.User = nil

	authenticated := entities.NewSession()
	authenticated.Authenticate(5*time.Minute, entities.NewUser())

	tests := []struct {
		input            uuid.UUID
		repositoryReturn *entities.Session
		expected         *entities.Session
	}{
		{
			input:            uuid.New(),
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			input:            uuid.New(),
			repositoryReturn: &entities.Session{},
			expected:         nil,
		},
		{
			input:            unauthenticated.ID,
			repositoryReturn: &unauthenticated,
			expected:         &strippedUnauthenticated,
		},
		{
			input:            authenticated.ID,
			repositoryReturn: &authenticated,
			expected:         &authenticated,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = services.ErrSessionInvalidID
		}

		repository.EXPECT().
			Get(ctx, test.input).
			Return(test.repositoryReturn, err)

		session, err := service.FindByID(ctx, test.input)
		if test.expected == nil {
			assert.Nil(t, session)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, session)
			assert.NoError(t, err)
		}
	}
}

func TestSessionFindByToken(t *testing.T) {
	repository, service := testutils.SetupSessionService()

	user := entities.NewUser()
	unauthenticated := entities.NewSession()
	unauthenticated.User = &user
	strippedUnauthenticated := unauthenticated
	strippedUnauthenticated.User = nil

	authenticated := entities.NewSession()
	authenticated.Authenticate(5*time.Minute, entities.NewUser())

	tests := []struct {
		input            string
		repositoryReturn *entities.Session
		expected         *entities.Session
	}{
		{
			input:            xid.New().String(),
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			input:            xid.New().String(),
			repositoryReturn: &entities.Session{},
			expected:         nil,
		},
		{
			input:            unauthenticated.Token,
			repositoryReturn: &unauthenticated,
			expected:         &strippedUnauthenticated,
		},
		{
			input:            authenticated.Token,
			repositoryReturn: &authenticated,
			expected:         &authenticated,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = services.ErrSessionInvalidToken
		}

		repository.EXPECT().
			GetWithToken(ctx, test.input).
			Return(test.repositoryReturn, err)

		session, err := service.FindByToken(ctx, test.input)
		if test.expected == nil {
			assert.Nil(t, session)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, session)
			assert.NoError(t, err)
		}
	}
}

func TestSessionUpdate(t *testing.T) {
	repository, service := testutils.SetupSessionService()

	user := entities.NewUser()
	unauthenticated := entities.NewSession()
	unauthenticated.User = &user
	strippedUnauthenticated := unauthenticated
	strippedUnauthenticated.User = nil

	authenticated := entities.NewSession()
	authenticated.Authenticate(5*time.Minute, entities.NewUser())

	tests := []struct {
		input    entities.Session
		expected *entities.Session
	}{
		{
			input:    entities.Session{},
			expected: nil,
		},
		{
			input:    unauthenticated,
			expected: &strippedUnauthenticated,
		},
		{
			input:    authenticated,
			expected: &authenticated,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = services.ErrSessionUpdate
		}

		repository.EXPECT().
			Update(ctx, test.input).
			Return(&test.input, err)

		session, err := service.Update(ctx, test.input)
		if test.expected == nil {
			assert.Nil(t, session)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, session)
			assert.NoError(t, err)
		}
	}
}

func TestSessionDelete(t *testing.T) {
	repository, service := testutils.SetupSessionService()

	tests := []struct {
		input    uuid.UUID
		expected error
	}{
		{
			input:    uuid.Nil,
			expected: services.ErrSessionDelete,
		},
		{
			input:    uuid.New(),
			expected: services.ErrSessionDelete,
		},
		{
			input:    uuid.New(),
			expected: nil,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		repository.EXPECT().
			Delete(ctx, test.input).
			Return(test.expected)

		err := service.Delete(ctx, test.input)
		if test.expected == nil {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

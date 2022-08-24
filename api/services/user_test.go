package services_test

import (
	"context"
	"errors"
	"testing"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/config"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewUser(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	expect := services.User{}
	assert.NotEqual(t, expect, service)
}

func TestUserNew(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	validUser := entities.NewUser()
	validConnection := entities.NewConnection("google", "000", validUser.ID)

	tests := []struct {
		newConnection entities.Connection
		newUser       entities.User
		expected      *entities.User
	}{
		{
			newConnection: entities.Connection{},
			newUser:       entities.User{},
			expected:      nil,
		},
		{
			newConnection: entities.Connection{
				ID:       uuid.New(),
				Provider: "invalid",
				Sub:      "000",
				UserID:   uuid.New(),
			},
			newUser:  validUser,
			expected: nil,
		},
		{
			newConnection: validConnection,
			newUser:       entities.User{},
			expected:      nil,
		},
		{
			newConnection: validConnection,
			newUser:       validUser,
			expected:      &validUser,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = errors.New("Failed")
		}

		repository.EXPECT().
			Create(ctx, test.newConnection, test.newUser).
			Return(test.expected, err)

		user, err := service.New(ctx, test.newConnection, test.newUser)

		if test.expected == nil {
			assert.Nil(t, user)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, user)
			assert.NoError(t, err)
		}
	}
}

func TestUserFind(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	incompleteID := uuid.New()
	incompleteUsername := "Raggy"
	incomplete := entities.NewUser()
	incomplete.ID = incompleteID
	incomplete.Username = incompleteUsername

	completeID := uuid.New()
	completeUsername := "Raggy2"
	complete := entities.NewUser()
	complete.ID = completeID
	complete.Username = completeUsername
	complete.Complete()

	tests := []struct {
		search           string
		strict           bool
		repositoryReturn *entities.User
		expected         *entities.User
	}{
		{
			search:           "",
			strict:           false,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			search:           incompleteUsername,
			strict:           true,
			repositoryReturn: &incomplete,
			expected:         nil,
		},
		{
			search:           incompleteID.String(),
			strict:           false,
			repositoryReturn: &incomplete,
			expected:         &incomplete,
		},
		{
			search:           completeID.String(),
			strict:           true,
			repositoryReturn: &complete,
			expected:         &complete,
		},
		{
			search:           completeUsername,
			strict:           true,
			repositoryReturn: &complete,
			expected:         &complete,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = errors.New("Failed")
		}

		repository.EXPECT().
			Get(ctx, test.search).
			Return(test.repositoryReturn, err)

		user, err := service.Find(ctx, test.search, test.strict)
		if test.expected == nil {
			assert.Nil(t, user)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, user)
			assert.NoError(t, err)
		}
	}
}

func TestUserFindConnection(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	id := uuid.New()
	username := "Raggy"

	expect := entities.NewUser()
	expect.ID = id
	expect.Username = username
	expect.Complete()

	tests := []struct {
		provider string
		sub      string
		expected *entities.User
	}{
		{
			provider: "",
			sub:      "",
			expected: nil,
		},
		{
			provider: "invalid",
			sub:      "000",
			expected: nil,
		},
		{
			provider: "google",
			sub:      "",
			expected: nil,
		},
		{
			provider: "google",
			sub:      "00001111",
			expected: &expect,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = errors.New("Failed")
		}

		repository.EXPECT().
			GetWithConnection(ctx, test.provider, test.sub).
			Return(test.expected, err)

		user, err := service.FindWithConnection(ctx, test.provider, test.sub)
		if test.expected == nil {
			assert.Nil(t, user)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, user)
			assert.NoError(t, err)
		}
	}
}

func TestUserFindStats(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	tests := []struct {
		input    uuid.UUID
		expected *entities.Stats
	}{
		{
			input:    uuid.New(),
			expected: nil,
		},
		{
			input: uuid.New(),
			expected: &entities.Stats{
				GamesPlayed:    1,
				PuzzlesCreated: 2,
				PuzzlesLiked:   3,
			},
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for i, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = errors.New("Failed")
		}

		repository.EXPECT().
			GetStats(ctx, test.input).
			Return(test.expected, err)

		stats, err := service.FindStats(ctx, test.input)
		if test.expected == nil {
			assert.Nil(t, stats, "(%d) Expected nil, got %v", i, stats)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, stats, "(%d) Expected %v, got %v", i, test.expected, stats)
			assert.NoError(t, err)
		}
	}
}

func TestUserUpdate(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	incomplete := entities.NewUser()
	incomplete.Username = "Raggy"

	complete := entities.NewUser()
	complete.Complete()

	tests := []struct {
		input    entities.User
		expected error
	}{
		{
			input:    entities.User{},
			expected: errors.New("Failed"),
		},
		{
			input:    incomplete,
			expected: nil,
		},
		{
			input:    complete,
			expected: nil,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		if test.expected == nil && !test.input.IsComplete() {
			test.input.Complete()
		}

		repository.EXPECT().
			Update(ctx, test.input).
			Return(&test.input, test.expected)

		user, err := service.Update(ctx, test.input)
		if test.expected == nil {
			assert.Equal(t, test.input, *user)
			assert.NoError(t, err)
		} else {
			assert.Nil(t, user)
			assert.Error(t, err)
		}
	}
}

func TestUserDelete(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.User{}

	service := services.NewUser(cfg, repository)

	tests := []struct {
		input    uuid.UUID
		expected error
	}{
		{
			input:    uuid.Nil,
			expected: errors.New("Failed"),
		},
		{
			input:    uuid.New(),
			expected: errors.New("failed"),
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

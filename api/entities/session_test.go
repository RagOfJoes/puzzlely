package entities_test

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestSessionNewSession(t *testing.T) {
	session := entities.NewSession()

	assert.NotZero(t, session.ID, "Expected valid ID, got %v", session.ID)
	assert.Equal(t, entities.Unauthenticated, session.State, "Expected %s, got %s", entities.Unauthenticated, session.State)
	assert.NotNil(t, session.Token, "Expected valid token, got %s", session.Token)
	assert.NotZero(t, session.CreatedAt, "Expected a non-zero time, got %v", session.CreatedAt)
	assert.Nil(t, session.ExpiresAt, "Expected a zero time, got %v", session.ExpiresAt)
	assert.Nil(t, session.AuthenticatedAt, "Expected a zero time, got %v", session.AuthenticatedAt)
	assert.Nil(t, session.User, "Expected nil user, got %v", session.User)
}

func TestSessionAuthenticate(t *testing.T) {
	updated := time.Now().Add(1 * time.Minute)
	user := entities.User{
		Base: entities.Base{
			ID:        uuid.New(),
			CreatedAt: time.Now(),
			UpdatedAt: &updated,
		},

		State:    entities.Complete,
		Username: "Test",
	}
	session := entities.Session{}
	session.User = &user

	lifetime := 5 * time.Minute
	session.Authenticate(lifetime, user)
	assert.Equal(t, entities.Authenticated, session.State, "Expected %s, got %s", entities.Authenticated, session.State)
	assert.NotNil(t, session.ExpiresAt, "Expected a non-zero time, got %v", session.ExpiresAt)
	assert.NotNil(t, session.AuthenticatedAt, "Expected a non-zero time, got %v", session.AuthenticatedAt)
	assert.Equal(t, user, *session.User, "Expected %v, got %v", user, session.User)
}

func TestSessionIsAuthenticated(t *testing.T) {
	authenticatedAt := time.Now()
	expire := authenticatedAt.Add(1 * time.Minute)
	user := entities.User{}

	tests := []struct {
		session  entities.Session
		expected bool
	}{
		{
			session:  entities.Session{},
			expected: false,
		},
		{
			session: entities.Session{
				State: entities.Authenticated,
			},
			expected: false,
		},
		{
			session: entities.Session{
				State:     entities.Authenticated,
				ExpiresAt: &expire,
			},
			expected: false,
		},
		{
			session: entities.Session{
				State:           entities.Authenticated,
				ExpiresAt:       &expire,
				AuthenticatedAt: &authenticatedAt,
				User:            &user,
			},
			expected: true,
		},
	}

	for i, test := range tests {
		isAuthenticated := test.session.IsAuthenticated()
		assert.Equal(t, test.expected, isAuthenticated, "(%d) Expected %v, got %v", i, test.expected, isAuthenticated)
	}
}

func TestSessionIsExpired(t *testing.T) {
	after := time.Now().Add(1 * time.Minute)
	before := time.Now().Add(-(1 * time.Minute))

	tests := []struct {
		session  entities.Session
		expected bool
	}{
		{
			session:  entities.Session{},
			expected: true,
		},
		{
			session: entities.Session{
				ExpiresAt: &before,
			},
			expected: true,
		},
		{
			session: entities.Session{
				ExpiresAt: &after,
			},
			expected: false,
		},
	}

	for i, test := range tests {
		isExpired := test.session.IsExpired()
		assert.Equal(t, test.expected, isExpired, "(%d) Expected %v, got %v", i, test.expected, isExpired)
	}
}

func TestSessionValidate(t *testing.T) {
	token := "Test"
	id := uuid.New()
	now := time.Now()
	auth := time.Now().Add(30 * time.Second)
	later := time.Now().Add(1 * time.Minute)
	user := entities.User{
		Base: entities.Base{
			ID:        uuid.New(),
			CreatedAt: now,
		},

		State:    entities.Pending,
		Username: "FakeUsername",
	}

	tests := []struct {
		session entities.Session
		isValid bool
	}{
		{
			session: entities.Session{},
			isValid: false,
		},
		{
			session: entities.Session{
				ID: uuid.Nil,
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:    id,
				State: "Invalid",
				Token: token,
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:    id,
				State: entities.Unauthenticated,
				Token: token,
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:        id,
				State:     entities.Unauthenticated,
				Token:     token,
				CreatedAt: time.Time{},
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:        id,
				State:     entities.Authenticated,
				Token:     token,
				CreatedAt: now,
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:        id,
				State:     entities.Authenticated,
				Token:     token,
				CreatedAt: now,
				ExpiresAt: &later,
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:              id,
				State:           entities.Authenticated,
				Token:           token,
				CreatedAt:       now,
				ExpiresAt:       &later,
				AuthenticatedAt: &now,
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:              id,
				State:           entities.Authenticated,
				Token:           token,
				CreatedAt:       now,
				ExpiresAt:       &later,
				AuthenticatedAt: &later,
			},
			isValid: false,
		},
		{
			session: entities.Session{
				ID:              id,
				State:           entities.Authenticated,
				Token:           token,
				CreatedAt:       now,
				ExpiresAt:       &later,
				AuthenticatedAt: &auth,

				User: &user,
			},
			isValid: true,
		},
	}

	for i, test := range tests {
		err := test.session.Validate()
		if test.isValid {
			assert.NoError(t, err, "(%d) Expected nil, got error %v", i, err)
		} else {
			assert.Error(t, err, "(%d) Expected error, got nil", i)
		}
	}
}

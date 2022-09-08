package entities

import (
	"context"
	"time"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/google/uuid"
	"github.com/rs/xid"
)

const userCtxKey = "_user"

var _ Entity = (*User)(nil)

// UserState defines what the user has done for their profile setup
type UserState string

const (
	// Pending occurs when user has at least one connection but has yet to create a unique username
	Pending UserState = "PENDING"
	// Complete occurs when user has completed all necessary profile setup steps
	Complete UserState = "COMPLETE"
)

// User defines a user of the app
type User struct {
	Base

	// State defines what the user has done for their profile setup
	State UserState `json:"state" validate:"required,oneof='PENDING' 'COMPLETE'"`
	// Username defines the user's unique username
	Username string `json:"username" validate:"required,notblank,alphanum,min=4,max=24"`
}

// NewUser creates a new user with a temporary username
func NewUser() User {
	id := uuid.New()
	now := time.Now()
	username := xid.New().String()

	return User{
		Base: Base{
			ID:        id,
			CreatedAt: now,
			UpdatedAt: nil,
		},

		State:    Pending,
		Username: username,
	}
}

// Complete updates user state to `Complete` and sets updatedAt field
func (u *User) Complete() {
	now := time.Now()

	u.UpdatedAt = &now
	u.State = Complete
}

// IsComplete checks whether the user has completed profile setup
func (u *User) IsComplete() bool {
	return u.UpdatedAt != nil && u.State == Complete
}

func (u *User) Validate() error {
	return validate.Check(u)
}

// UserNewContext creates a new context that carries user
func UserNewContext(ctx context.Context, user User) context.Context {
	return context.WithValue(ctx, userCtxKey, &user)
}

// UserFromContext attempts to retrieve user stored in context
func UserFromContext(ctx context.Context) *User {
	value, ok := ctx.Value(userCtxKey).(*User)
	if !ok || value == nil {
		return nil
	}

	return value
}

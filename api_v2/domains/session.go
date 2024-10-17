package domains

import (
	"context"
	"database/sql"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/oklog/ulid/v2"
	"github.com/uptrace/bun"
)

const sessionCtxKey = "_session"

var _ Domain = (*Session)(nil)

// SessionState defines the current state of the session
type SessionState string

const (
	// Unauthenticated occurs when the session has just been created
	Unauthenticated SessionState = "Unauthenticated"
	// Authenticated occurs when the user has successfully logged in
	Authenticated SessionState = "Authenticated"
)

// Session defines a user session
type Session struct {
	bun.BaseModel

	// ID defines the unique id for the session
	ID string `bun:"type:varchar(26),pk,notnull" json:"id"`
	// State defines the current state of the Session
	State SessionState `bun:"type:varchar(15),default:'Unauthenticated',notnull" json:"state"`

	// CreatedAt defines when the session was created
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	// AuthenticatedAt defines the time when user was successfully logged in
	AuthenticatedAt bun.NullTime `bun:",nullzero,default:NULL" json:"authenticated_at"`
	// ExpiresAt defines the expiration of the session. This'll only be applicable when `State` is `Authenticated`
	ExpiresAt bun.NullTime `bun:",nullzero,default:NULL" json:"expires_at"`

	UserID sql.NullString `bun:"type:varchar(26)" json:"-"`
	// User is the user, if any, that the session belongs to
	User *User `bun:"rel:belongs-to,join:user_id=id" json:"user"`
}

// NewSession creates a new session
func NewSession() Session {
	return Session{
		ID:    ulid.Make().String(),
		State: Unauthenticated,

		CreatedAt: time.Now(),
	}
}

// Authenticate authenticates the session
func (s *Session) Authenticate(expire time.Time, user User) error {
	now := time.Now()
	s.State = Authenticated
	s.AuthenticatedAt = bun.NullTime{
		Time: now,
	}
	s.ExpiresAt = bun.NullTime{
		Time: expire,
	}
	s.UserID = sql.NullString{
		String: user.ID,
		Valid:  true,
	}
	s.User = &user

	return nil
}

// IsAuthenticated checks whether the session is propery authenticated and not expired
func (s *Session) IsAuthenticated() bool {
	if s.State == Authenticated && !s.AuthenticatedAt.IsZero() && !s.IsExpired() && s.User != nil {
		return true
	}

	return false
}

// IsExpired checks whether the session has ExpiresAt set or is expired
func (s *Session) IsExpired() bool {
	if s.ExpiresAt.IsZero() || s.ExpiresAt.Time.Before(time.Now()) {
		return true
	}

	return false
}

func (s Session) Validate() error {
	return validation.ValidateStruct(&s,
		validation.Field(&s.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&s.State, validation.Required, validation.In(Unauthenticated, Authenticated)),

		validation.Field(&s.CreatedAt, validation.Required),
		validation.Field(&s.AuthenticatedAt, validation.When(!s.AuthenticatedAt.IsZero(), validation.By(internal.IsAfter(s.CreatedAt)))),
		validation.Field(&s.ExpiresAt, validation.When(!s.ExpiresAt.IsZero(), validation.By(internal.IsAfter(s.CreatedAt)))),

		validation.Field(&s.UserID, validation.When(s.UserID.Valid, validation.By(internal.IsULID))),
		validation.Field(&s.User, validation.When(s.User != nil, validation.Required)),
	)
}

// SessionNewContext creates a new context that carries session
func SessionNewContext(ctx context.Context, session Session) context.Context {
	return context.WithValue(ctx, sessionCtxKey, &session)
}

// SessionFromContext attempts to retrieve session stored in context
func SessionFromContext(ctx context.Context) *Session {
	session, ok := ctx.Value(sessionCtxKey).(*Session)
	if !ok || session == nil {
		return nil
	}

	return session
}

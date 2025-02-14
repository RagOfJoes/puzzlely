package domains

import (
	"fmt"
	"time"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/oklog/ulid/v2"
	"github.com/uptrace/bun"
)

var _ Domain = (*User)(nil)

type User struct {
	bun.BaseModel

	ID       string `bun:"type:varchar(26),pk,notnull" json:"id"`
	State    string `bun:"type:varchar(8),default:'PENDING',notnull" json:"state"`
	Username string `bun:"type:varchar(64),unique,notnull" json:"username"`

	CreatedAt time.Time    `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt bun.NullTime `bun:",nullzero,default:NULL" json:"updated_at"`
	DeletedAt bun.NullTime `bun:",soft_delete,nullzero,default:NULL" json:"-"`
}

func NewUser() User {
	id := ulid.Make().String()

	return User{
		ID:       id,
		State:    "PENDING",
		Username: fmt.Sprintf("temp-%s", id),

		CreatedAt: time.Now(),
	}
}

// IsComplete checks if the user has completed all the steps to setup their profile
func (u *User) IsComplete() bool {
	return u.State == "COMPLETE" && !u.UpdatedAt.IsZero()
}

func (u User) Validate() error {
	return validation.ValidateStruct(&u,
		validation.Field(&u.ID, validation.Required, validation.By(internal.IsULID)),
		validation.Field(&u.State, validation.Required, validation.In("PENDING", "COMPLETE")),
		validation.Field(&u.Username, validation.Required, validation.Length(4, 64), internal.IsUsername),
		validation.Field(&u.CreatedAt, validation.Required),
		validation.Field(&u.UpdatedAt, validation.When(!u.UpdatedAt.IsZero(), validation.By(internal.IsAfter(u.CreatedAt)))),
		validation.Field(&u.DeletedAt, validation.When(!u.DeletedAt.IsZero(), validation.By(internal.IsAfter(u.CreatedAt)))),
	)
}

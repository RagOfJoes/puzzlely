package domains

import (
	"net/http"

	"github.com/RagOfJoes/puzzlely/internal"
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type UserUpdatePayload struct {
	Username string `json:"username"`
}

func (u *UserUpdatePayload) Bind(r *http.Request) error {
	return nil
}

func (u UserUpdatePayload) Validate() error {
	return validation.ValidateStruct(&u,
		validation.Field(&u.Username, validation.Required, validation.Length(4, 64), internal.IsUsername),
	)
}

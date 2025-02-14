package domains

import (
	"net/http"
	"strings"

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
	for _, reserved := range internal.ReservedUsernames {
		if strings.EqualFold(u.Username, reserved) {
			return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", "Username is not available.")
		}
	}

	return validation.ValidateStruct(&u,
		validation.Field(&u.Username, validation.Required, validation.Length(4, 64), internal.IsUsername, internal.IsSanitized, internal.IsClean),
	)
}

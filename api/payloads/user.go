package payloads

import (
	"net/http"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/sanitize"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/go-chi/render"
)

var _ render.Binder = (*UpdateUser)(nil)

// UpdateUser defines the payload required for updating a user
type UpdateUser struct {
	Username string `json:"username" validate:"required,notblank,alphanum,min=4,max=24"`
}

func (u *UpdateUser) Bind(r *http.Request) error {
	return nil
}

// Validate validates the payload
func (u *UpdateUser) Validate() error {
	if err := validate.Check(u); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := sanitize.IsClean(u.Username, true); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", "Invalid username provided.")
	}

	return nil
}

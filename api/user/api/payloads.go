package api

import (
	"net/http"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/sanitize"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/user"
)

type UpdateUserPayload struct {
	Username string `json:"username" validate:"required,notblank,alphanum,min=4,max=24"`
}

func (u *UpdateUserPayload) Bind(r *http.Request) error {
	return nil
}

func (u *UpdateUserPayload) Validate() error {
	if err := validate.Check(u); err != nil {
		return internal.NewErrorf(internal.ErrorCodeBadRequest, "%v", err)
	}
	if err := sanitize.IsClean(u.Username, true); err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeBadRequest, "%v", user.ErrInvalidUsername)
	}
	return nil
}

package auth

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/validate"
)

const (
	discordAvatarURL = "https://media.discordapp.net/avatars/"
)

// Profile defines common information that is retrieved from most OAuth2 providers
//
// TODO: Decide whether other fields will be useful for future features
type Profile struct {
	ID        string `validate:"required"`
	AvatarURL string
	FirstName string
	LastName  string
	Location  string
	Provider  string `validate:"required,oneof='discord' 'github' 'google'"`
}

func ProfileFromBits(bits []byte, provider string) (*Profile, error) {
	switch provider {
	case "discord":
		user := struct {
			ID            string `json:"id"`
			Name          string `json:"username"`
			Email         string `json:"email"`
			AvatarID      string `json:"avatar"`
			MFAEnabled    bool   `json:"mfa_enabled"`
			Discriminator string `json:"discriminator"`
			Verified      bool   `json:"verified"`
		}{}

		if err := json.Unmarshal(bits, &user); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrFailedDiscord)
		}

		avatarURL := ""
		if len(user.AvatarID) > 0 {
			prefix := "a_"
			extension := ".jpg"
			if len(user.AvatarID) >= len(prefix) && user.AvatarID[0:len(prefix)] == prefix {
				extension = ".gif"
			}
			avatarURL = fmt.Sprintf("%s%s/%s%s", discordAvatarURL, user.ID, user.AvatarID, extension)
		}

		profile := Profile{
			ID:        user.ID,
			AvatarURL: avatarURL,
			Provider:  provider,
		}
		if err := validate.Check(profile); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrFailedDiscord)
		}

		return &profile, nil
	case "github":
		user := struct {
			ID       int    `json:"id"`
			Email    string `json:"email"`
			Bio      string `json:"bio"`
			Name     string `json:"name"`
			Login    string `json:"login"`
			Picture  string `json:"avatar_url"`
			Location string `json:"location"`
		}{}

		if err := json.Unmarshal(bits, &user); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrFailedGitHub)
		}

		profile := Profile{
			ID:        strconv.Itoa(user.ID),
			AvatarURL: user.Picture,
			Location:  user.Location,
			Provider:  provider,
		}
		if err := validate.Check(profile); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrFailedGitHub)
		}

		return &profile, nil
	case "google":
		user := struct {
			ID        string `json:"sub"`
			Email     string `json:"email"`
			Name      string `json:"name"`
			FirstName string `json:"given_name"`
			LastName  string `json:"family_name"`
			Link      string `json:"link"`
			Picture   string `json:"picture"`
		}{}

		if err := json.Unmarshal(bits, &user); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrFailedGoogle)
		}

		profile := Profile{
			ID:        user.ID,
			AvatarURL: user.Picture,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Provider:  provider,
		}
		if err := validate.Check(profile); err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", ErrFailedGoogle)
		}

		return &profile, nil
	default:
		return nil, nil
	}
}

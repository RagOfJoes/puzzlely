package sanitize

import (
	"fmt"
	"strings"

	goaway "github.com/TwiN/go-away"
	"github.com/microcosm-cc/bluemonday"
	"github.com/sirupsen/logrus"
)

// Singleton
var sanitize *Sanitize

type Sanitize struct {
	html      bluemonday.Policy
	profanity goaway.ProfanityDetector
}

func init() {
	html := bluemonday.UGCPolicy()
	profanity := goaway.NewProfanityDetector()

	sanitize = &Sanitize{
		html:      *html,
		profanity: *profanity,
	}

	logrus.Info("Initialized Sanitizer")
}

// Censor censors profane words from string
func Censor(str string) string {
	return sanitize.profanity.Censor(str)
}

// HTML strips HTML entities from string
func HTML(str string) string {
	return sanitize.html.Sanitize(str)
}

// IsClean checks whether a string contains HTML entities, profanity, or, reserved words(If enabled)
func IsClean(str string, reserved bool) error {
	if sanitized := sanitize.html.Sanitize(str); !strings.EqualFold(sanitized, str) {
		return fmt.Errorf("%s contains HTML characters", sanitized)
	}
	if sanitize.profanity.IsProfane(str) {
		return fmt.Errorf("%s contains profane characters: %s", str, sanitize.profanity.ExtractProfanity(str))
	}

	if reserved {
		for _, word := range ReservedNames {
			if strings.EqualFold(str, word) {
				return fmt.Errorf("%s is a reserved word", str)
			}
		}
	}

	return nil
}

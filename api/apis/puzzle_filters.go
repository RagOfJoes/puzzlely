package apis

import (
	"net/http"
	"strconv"

	"github.com/RagOfJoes/puzzlely/entities"
)

// Retrieves puzzle filters from URL query
func getPuzzleFilters(r *http.Request) (*entities.PuzzleFilters, error) {
	var customizableAttempts *bool
	var customizableTime *bool
	var difficulty *entities.PuzzleDifficulty
	var numOfLikes *uint16
	if attempts, err := strconv.ParseBool(r.URL.Query().Get("customizable_attempts")); err == nil {
		customizableAttempts = &attempts
	}
	if time, err := strconv.ParseBool(r.URL.Query().Get("customizable_time")); err == nil {
		customizableTime = &time
	}
	if str := r.URL.Query().Get("difficulty"); len(str) > 0 {
		diff := entities.PuzzleDifficulty(str)
		difficulty = &diff
	}
	if num, err := strconv.ParseUint(r.URL.Query().Get("num_of_likes"), 0, 16); err == nil {
		conv := uint16(num)
		numOfLikes = &conv
	}

	filters := entities.PuzzleFilters{
		CustomizableAttempts: customizableAttempts,
		CustomizableTime:     customizableTime,
		Difficulty:           difficulty,
		NumOfLikes:           numOfLikes,
	}
	if err := filters.Validate(); err != nil {
		return nil, err
	}

	return &filters, nil
}

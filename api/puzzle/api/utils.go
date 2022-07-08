package api

import (
	"net/http"
	"strconv"

	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/puzzle"
)

func getFilters(r *http.Request) (*puzzle.Filters, error) {
	var customizableAttempts *bool
	var customizableTime *bool
	var difficulty *puzzle.Difficulty
	var numOfLikes *uint16
	if attempts, err := strconv.ParseBool(r.URL.Query().Get("customizable_attempts")); err == nil {
		customizableAttempts = &attempts
	}
	if time, err := strconv.ParseBool(r.URL.Query().Get("customizable_time")); err == nil {
		customizableTime = &time
	}
	if str := r.URL.Query().Get("difficulty"); len(str) > 0 {
		diff := puzzle.Difficulty(str)
		difficulty = &diff
	}
	if num, err := strconv.ParseUint(r.URL.Query().Get("num_of_likes"), 0, 16); err == nil {
		conv := uint16(num)
		numOfLikes = &conv
	}

	filters := puzzle.Filters{
		CustomizableAttempts: customizableAttempts,
		CustomizableTime:     customizableTime,
		Difficulty:           difficulty,
		NumOfLikes:           numOfLikes,
	}
	if err := validate.Check(filters); err != nil {
		return nil, err
	}

	return &filters, nil
}

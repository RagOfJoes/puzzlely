package puzzle

// Filters
type Filters struct {
	CustomizableAttempts *bool       `json:"customizableAttempts" validate:"omitempty"`
	CustomizableTime     *bool       `json:"customizableTime" validate:"omitempty"`
	Difficulty           *Difficulty `json:"difficulty" validate:"omitempty,oneof='Easy' 'Medium' 'Hard'"`
	NumOfLikes           *uint16     `json:"numofLikes" validate:"omitempty,min=0,max=999"`
}

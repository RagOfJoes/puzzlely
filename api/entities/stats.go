package entities

// Stats defines a user's stats
type Stats struct {
	GamesPlayed    int `json:"gamesPlayed"`
	PuzzlesCreated int `json:"puzzlesCreated"`
	PuzzlesLiked   int `json:"puzzlesLiked"`
}

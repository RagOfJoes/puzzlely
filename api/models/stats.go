package models

// Stats defines the db model for user stats
type Stats struct {
	GamesPlayed    int `db:"games_played"`
	PuzzlesCreated int `db:"puzzles_created"`
	PuzzlesLiked   int `db:"puzzles_liked"`
}

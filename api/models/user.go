package models

var _ Model = (*User)(nil)

// User defines the db model for a user
type User struct {
	Base

	State    string `db:"state"`
	Username string `db:"username"`
}

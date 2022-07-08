package config

type Database struct {
	// Driver defines the type of database.
	Driver string `validate:"required,oneof='mysql' 'postgres'"`
	// DSN
	DSN string `validate:"required"`
}

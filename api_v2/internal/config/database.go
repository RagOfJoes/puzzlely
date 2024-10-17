package config

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

type Database struct {
	// Driver defines the type of database.
	Driver   string
	Host     string
	Name     string
	Password string
	Port     string
	User     string
}

func (d Database) Validate() error {
	return validation.ValidateStruct(&d,
		validation.Field(&d.Driver, validation.Required, validation.In("mysql", "postgres")),
		validation.Field(&d.Host, validation.Required),
		validation.Field(&d.Name, validation.Required),
		validation.Field(&d.Password, validation.Required),
		validation.Field(&d.Port, validation.Required, is.Port),
		validation.Field(&d.User, validation.Required),
	)
}

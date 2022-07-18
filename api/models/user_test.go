package models_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/models"
	"github.com/stretchr/testify/assert"
)

func TestUserTableName(t *testing.T) {
	expect := "users"
	model := models.User{}
	tableName := model.TableName()
	assert.Equal(t, expect, tableName, "Expected %s, got %s", expect, tableName)
}

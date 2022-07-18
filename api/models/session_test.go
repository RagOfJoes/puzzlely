package models_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/models"
	"github.com/stretchr/testify/assert"
)

func TestSessionTableName(t *testing.T) {
	expect := "sessions"
	model := models.Session{}
	tableName := model.TableName()
	assert.Equal(t, expect, tableName, "Expected %s, got %s", expect, tableName)
}

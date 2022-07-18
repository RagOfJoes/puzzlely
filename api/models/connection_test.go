package models_test

import (
	"testing"

	"github.com/RagOfJoes/puzzlely/models"
	"github.com/stretchr/testify/assert"
)

func TestConnectionTableName(t *testing.T) {
	expect := "connections"
	model := models.Connection{}
	tableName := model.TableName()
	assert.Equal(t, expect, tableName, "Expected %s, got %s", expect, tableName)
}

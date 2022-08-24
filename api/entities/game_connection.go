package entities

import (
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/validate"
)

var _ Entity = (*GameConnection)(nil)

type GameConnection struct {
	Edges    []GameEdge `json:"edges" validate:"required,dive"`
	PageInfo PageInfo   `json:"pageInfo" validate:"required"`
}

func BuildGameConnection(limit int, sortKey string, nodes []GameNode) (*GameConnection, error) {
	var edges []GameEdge
	for _, node := range nodes {
		cursor, err := NewCursor(internal.ToCamel(sortKey, true), node)
		if err != nil {
			return nil, err
		}
		edges = append(edges, GameEdge{
			Cursor: cursor,
			Node:   node,
		})
	}

	hasNextPage := len(edges) > limit-1
	pageInfo := PageInfo{
		Cursor:      "",
		HasNextPage: hasNextPage,
	}
	if hasNextPage {
		pageInfo.Cursor = edges[len(edges)-1].Cursor
		edges = edges[:len(edges)-1]
	}

	// If edges was not initialized then do so here to not trigger validation error
	if edges == nil {
		edges = []GameEdge{}
	}
	connection := GameConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := connection.Validate(); err != nil {
		return nil, err
	}

	return &connection, nil
}

func (g *GameConnection) Validate() error {
	return validate.Check(g)
}

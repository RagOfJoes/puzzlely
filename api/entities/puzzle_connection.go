package entities

import (
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/validate"
)

var _ Entity = (*PuzzleConnection)(nil)

// PuzzleConnection defines a paginated list of puzzles
type PuzzleConnection struct {
	Edges    []PuzzleEdge `json:"edges" validate:"required,dive"`
	PageInfo PageInfo     `json:"pageInfo" validate:"required"`
}

func BuildPuzzleConnection(limit int, sortKey string, nodes []PuzzleNode) (*PuzzleConnection, error) {
	var edges []PuzzleEdge
	for _, node := range nodes {
		cursor, err := NewCursor(internal.ToCamel(sortKey, true), node)
		if err != nil {
			return nil, err
		}
		edges = append(edges, PuzzleEdge{
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
		edges = []PuzzleEdge{}
	}
	connection := PuzzleConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := validate.Check(connection); err != nil {
		return nil, err
	}

	return &connection, nil
}

func (p *PuzzleConnection) Validate() error {
	return validate.Check(p)
}

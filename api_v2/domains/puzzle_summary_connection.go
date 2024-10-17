package domains

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

const (
	puzzleSummaryConnectionLimit = 2
)

var _ Domain = (*PuzzleSummaryConnection)(nil)

type PuzzleSummaryConnection struct {
	Edges    []PuzzleSummaryEdge `json:"edges"`
	PageInfo PageInfo            `json:"page_info"`
}

func BuildPuzzleSummaryConnection(sortKey string, nodes []PuzzleSummary) (*PuzzleSummaryConnection, error) {
	var edges []PuzzleSummaryEdge
	for _, node := range nodes {
		cursor, err := NewCursor(sortKey, node)
		if err != nil {
			return nil, err
		}

		edges = append(edges, PuzzleSummaryEdge{
			Cursor: cursor,
			Node:   node,
		})
	}

	hasNextPage := len(edges) > puzzleSummaryConnectionLimit-1
	pageInfo := PageInfo{
		Cursor:      "",
		HasNextPage: hasNextPage,
	}
	if hasNextPage {
		pageInfo.Cursor = edges[len(edges)-1].Cursor
		edges = edges[:len(edges)-1]
	}

	// If edges were not initialized then do so here to not trigger validation error
	if edges == nil {
		edges = []PuzzleSummaryEdge{}
	}

	connection := PuzzleSummaryConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := connection.Validate(); err != nil {
		return nil, err
	}

	return &connection, nil
}

func (p PuzzleSummaryConnection) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Edges, validation.NotNil),
		validation.Field(&p.PageInfo, validation.Required),
	)
}

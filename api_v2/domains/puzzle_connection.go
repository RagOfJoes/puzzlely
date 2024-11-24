package domains

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var _ Domain = (*PuzzleConnection)(nil)

type PuzzleConnection struct {
	Edges    []PuzzleEdge `json:"edges"`
	PageInfo PageInfo     `json:"page_info"`
}

func BuildPuzzleConnection(nodes []Puzzle, limit int) (*PuzzleConnection, error) {
	edges := make([]PuzzleEdge, 0)
	for _, node := range nodes {
		edges = append(edges, PuzzleEdge{
			Cursor: NewCursor(node.CreatedAt.Format("2006-01-02 15:04:05.000000")),
			Node:   node,
		})
	}

	pageInfo := PageInfo{
		HasNextPage:     len(edges) > limit,
		HasPreviousPage: false,
		NextCursor:      "",
		PreviousCursor:  "",
	}
	if pageInfo.HasNextPage {
		pageInfo.NextCursor = edges[len(edges)-1].Cursor
		edges = edges[:len(edges)-1]
	}

	connection := PuzzleConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := connection.Validate(); err != nil {
		return nil, err
	}

	return &connection, nil
}

func (p PuzzleConnection) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Edges, validation.NotNil),
		validation.Field(&p.PageInfo, validation.Required),
	)
}

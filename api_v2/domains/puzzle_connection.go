package domains

import (
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var _ Domain = (*PuzzleConnection)(nil)

type PuzzleConnection struct {
	Edges    []PuzzleEdge `json:"edges"`
	PageInfo PageInfo     `json:"page_info"`
}

func BuildPuzzleConnection(nodes []Puzzle) (*PuzzleConnection, error) {
	edges := make([]PuzzleEdge, 0)
	for _, node := range nodes {
		edges = append(edges, PuzzleEdge{
			Cursor: NewCursor(node.CreatedAt.Format(time.RFC3339)),
			Node:   node,
		})
	}

	pageInfo := PageInfo{
		HasNextPage:     false,
		HasPreviousPage: false,
		NextCursor:      "",
		PreviousCursor:  "",
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

package domains

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var _ Domain = (*PuzzleSummaryConnection)(nil)

type PuzzleSummaryConnection struct {
	Edges    []PuzzleSummaryEdge `json:"edges"`
	PageInfo PageInfo            `json:"page_info"`
}

func BuildPuzzleSummaryConnection(nodes []PuzzleSummary, limit int) (*PuzzleSummaryConnection, error) {
	edges := make([]PuzzleSummaryEdge, 0)
	for _, node := range nodes {
		edges = append(edges, PuzzleSummaryEdge{
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

	connection := PuzzleSummaryConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := connection.Validate(); err != nil {
		return nil, err
	}

	return &connection, nil
}

func BuildPuzzleSummaryConnectionForLiked(nodes []PuzzleSummary, limit int) (*PuzzleSummaryConnection, error) {
	edges := make([]PuzzleSummaryEdge, 0)
	for _, node := range nodes {
		edges = append(edges, PuzzleSummaryEdge{
			Cursor: NewCursor(node.LikedAt.Format("2006-01-02 15:04:05.000000")),
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

package domains

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var _ Domain = (*GameSummaryConnection)(nil)

type GameSummaryConnection struct {
	Edges    []GameSummaryEdge `json:"edges"`
	PageInfo PageInfo          `json:"page_info"`
}

func BuildGameSummaryConnection(nodes []GameSummary, limit int) (*GameSummaryConnection, error) {
	edges := make([]GameSummaryEdge, 0)
	for _, node := range nodes {
		edges = append(edges, GameSummaryEdge{
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

	connection := GameSummaryConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := connection.Validate(); err != nil {
		return nil, err
	}

	return &connection, nil
}

func (g GameSummaryConnection) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.Edges, validation.NotNil),
		validation.Field(&g.PageInfo, validation.Required),
	)
}

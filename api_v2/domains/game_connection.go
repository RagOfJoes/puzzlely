package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

const (
	gameConnectionLimit = 11
)

var _ Domain = (*GameConnection)(nil)

type GameConnection struct {
	Edges    []GameEdge `json:"edges"`
	PageInfo PageInfo   `json:"page_info"`
}

func BuildGameConnection(sortKey string, nodes []GameSummary) (*GameConnection, error) {
	var edges []GameEdge
	for _, node := range nodes {
		edges = append(edges, GameEdge{
			Cursor: NewCursor(node.CreatedAt.String()),
			Node:   node,
		})
	}

	hasNextPage := len(edges) > gameConnectionLimit-1
	pageInfo := PageInfo{
		// Cursor:      "",
		HasNextPage: hasNextPage,
	}
	if hasNextPage {
		// pageInfo.Cursor = edges[len(edges)-1].Cursor
		edges = edges[:len(edges)-1]
	}

	// If edges were not initialized then do so here to not trigger validation error
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

func (p GameConnection) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Edges, validation.NotNil),
		validation.Field(&p.PageInfo, validation.Required),
	)
}

package domains

import validation "github.com/go-ozzo/ozzo-validation/v4"

const (
	puzzleConnectionLimit = 11
)

var _ Domain = (*PuzzleConnection)(nil)

type PuzzleConnection struct {
	Edges    []PuzzleEdge `json:"edges"`
	PageInfo PageInfo     `json:"page_info"`
}

func BuildPuzzleConnection(sortKey string, nodes []Puzzle) (*PuzzleConnection, error) {
	var edges []PuzzleEdge
	for _, node := range nodes {
		cursor, err := NewCursor(sortKey, node)
		if err != nil {
			return nil, err
		}

		edges = append(edges, PuzzleEdge{
			Cursor: cursor,
			Node:   node,
		})
	}

	hasNextPage := len(edges) > puzzleConnectionLimit-1
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
		edges = []PuzzleEdge{}
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

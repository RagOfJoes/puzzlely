package usecase

import (
	"github.com/RagOfJoes/puzzlely/internal"
	"github.com/RagOfJoes/puzzlely/internal/pagination"
	"github.com/RagOfJoes/puzzlely/internal/validate"
	"github.com/RagOfJoes/puzzlely/puzzle"
)

func buildConnection(list []*puzzle.Node, limit int, sortKey string) (*puzzle.Connection, error) {
	var edges []*puzzle.Edge
	for _, node := range list {
		cursor, err := pagination.EncodeCursor(internal.ToCamel(sortKey, true), node)
		if err != nil {
			return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
		}
		edges = append(edges, &puzzle.Edge{
			Node:   node,
			Cursor: cursor,
		})
	}

	hasNextPage := len(edges) > limit-1
	pageInfo := puzzle.PageInfo{
		Cursor:      "",
		HasNextPage: hasNextPage,
	}
	if hasNextPage {
		pageInfo.Cursor = edges[len(edges)-1].Cursor
		edges = edges[:len(edges)-1]
	}

	// If edges was not initialized then do so here to not trigger validation error
	if edges == nil {
		edges = []*puzzle.Edge{}
	}
	connection := puzzle.Connection{
		Edges:    edges,
		PageInfo: pageInfo,
	}
	if err := validate.Check(connection); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeInternal, "%v", puzzle.ErrFailedList)
	}

	return &connection, nil
}

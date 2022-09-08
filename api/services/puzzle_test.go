package services_test

import (
	"context"
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/RagOfJoes/puzzlely/internal/testutils"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/brianvoe/gofakeit/v6"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewPuzzle(t *testing.T) {
	cfg := config.Configuration{}
	repository := &mocks.Puzzle{}

	service := services.NewPuzzle(cfg, repository)

	assert.NotZero(t, service)
}

func TestPuzzleNew(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	puzzle := testutils.GeneratePuzzles(t, 1)[0]

	tests := []struct {
		input    entities.Puzzle
		expected *entities.Puzzle
	}{
		{
			input:    entities.Puzzle{},
			expected: nil,
		},
		{
			input:    puzzle,
			expected: &puzzle,
		},
	}

	ctx := context.Background()
	defer ctx.Done()

	for _, test := range tests {
		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleCreate
		}

		repository.EXPECT().
			Create(ctx, test.input).
			Return(test.expected, err)

		session, err := service.New(ctx, test.input)
		if test.expected == nil {
			assert.Nil(t, session)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, session)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleFind(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	puzzles := testutils.GeneratePuzzles(t, 5)

	tests := []struct {
		ctx              context.Context
		inputID          uuid.UUID
		inputStrict      bool
		repositoryReturn *entities.Puzzle
		expected         *entities.Puzzle
	}{
		{
			ctx:              context.Background(),
			inputID:          uuid.New(),
			inputStrict:      true,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              context.Background(),
			inputID:          puzzles[0].ID,
			inputStrict:      true,
			repositoryReturn: &puzzles[0],
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), puzzles[2].CreatedBy),
			inputID:          puzzles[1].ID,
			inputStrict:      true,
			repositoryReturn: &puzzles[1],
			expected:         nil,
		},
		{
			ctx:              context.Background(),
			inputID:          puzzles[2].ID,
			inputStrict:      false,
			repositoryReturn: &puzzles[2],
			expected:         &puzzles[2],
		},
		{
			ctx:              entities.UserNewContext(context.Background(), puzzles[4].CreatedBy),
			inputID:          puzzles[3].ID,
			inputStrict:      false,
			repositoryReturn: &puzzles[3],
			expected:         &puzzles[3],
		},
		{
			ctx:              entities.UserNewContext(context.Background(), puzzles[4].CreatedBy),
			inputID:          puzzles[4].ID,
			inputStrict:      true,
			repositoryReturn: &puzzles[4],
			expected:         &puzzles[4],
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleNotFound
		}

		repository.EXPECT().
			Get(test.ctx, test.inputID).
			Return(test.repositoryReturn, err)

		found, err := service.Find(test.ctx, test.inputID, test.inputStrict)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleFindCreated(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	users := testutils.GenerateUsers(t, 4)

	nodes := testutils.GeneratePuzzleNodes(t, 30)
	for i := range nodes {
		if i > 9 {
			nodes[i].CreatedBy = users[2]
		}
		if i > 24 {
			date := gofakeit.Date()
			nodes[i].LikedAt = &date
			nodes[i].NumOfLikes = uint(gofakeit.Uint64())
		}
	}

	firstPage := entities.Pagination{
		Cursor:    "",
		SortKey:   "created_at",
		SortOrder: "DESC",
		Limit:     10,
	}

	cursor, err := entities.NewCursor("createdAt", nodes[21])
	require.NoError(t, err)

	secondPage := entities.Pagination{
		Cursor:    cursor,
		SortKey:   "created_at",
		SortOrder: "DESC",
		Limit:     10,
	}

	expectedFirstPage, err := entities.BuildPuzzleConnection(firstPage.Limit+1, firstPage.SortKey, nodes[10:20])
	require.NoError(t, err)

	expectedSecondPage, err := entities.BuildPuzzleConnection(secondPage.Limit+1, secondPage.SortKey, nodes[21:24])
	require.NoError(t, err)

	expectedAuthenticated, err := entities.BuildPuzzleConnection(firstPage.Limit+1, firstPage.SortKey, nodes[25:])
	require.NoError(t, err)

	tests := []struct {
		ctx              context.Context
		inputParams      entities.Pagination
		inputUser        entities.User
		repositoryReturn []entities.PuzzleNode
		expected         *entities.PuzzleConnection
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "incorrect createdBy"),
			inputParams:      firstPage,
			inputUser:        users[0],
			repositoryReturn: nodes[:9],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "empty nodes"),
			inputParams:      firstPage,
			inputUser:        users[1],
			repositoryReturn: []entities.PuzzleNode{},
			expected:         &entities.PuzzleConnection{Edges: []entities.PuzzleEdge{}},
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "basic"),
			inputParams:      firstPage,
			inputUser:        users[2],
			repositoryReturn: nodes[10:20],
			expected:         expectedFirstPage,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "second page"),
			inputParams:      secondPage,
			inputUser:        users[2],
			repositoryReturn: nodes[21:24],
			expected:         expectedSecondPage,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), users[3]),
			inputParams:      firstPage,
			inputUser:        users[2],
			repositoryReturn: nodes[25:],
			expected:         expectedAuthenticated,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleList
		}

		// Simulate service adding 1 to the limit
		test.inputParams.Limit = test.inputParams.Limit + 1

		repository.EXPECT().
			GetCreated(test.ctx, test.inputParams, test.inputUser.ID).
			Return(test.repositoryReturn, err)

		// Decrement by 1 before submitting to service
		test.inputParams.Limit = test.inputParams.Limit - 1

		found, err := service.FindCreated(test.ctx, test.inputParams, test.inputUser)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleFindLiked(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	users := testutils.GenerateUsers(t, 3)

	nodes := testutils.GeneratePuzzleNodes(t, 25)
	for i := range nodes {
		if i > 9 {
			date := gofakeit.Date()
			nodes[i].LikedAt = &date
			nodes[i].NumOfLikes = uint(gofakeit.Uint64())
		}
	}

	firstPage := entities.Pagination{
		Cursor:    "",
		SortKey:   "liked_at",
		SortOrder: "DESC",
		Limit:     10,
	}

	cursor, err := entities.NewCursor("likedAt", nodes[21])
	require.NoError(t, err)

	secondPage := entities.Pagination{
		Cursor:    cursor,
		SortKey:   "liked_at",
		SortOrder: "DESC",
		Limit:     10,
	}

	expectedFirstPage, err := entities.BuildPuzzleConnection(firstPage.Limit+1, firstPage.SortKey, nodes[10:20])
	require.NoError(t, err)

	expectedSecondPage, err := entities.BuildPuzzleConnection(secondPage.Limit+1, secondPage.SortKey, nodes[21:])
	require.NoError(t, err)

	tests := []struct {
		ctx              context.Context
		inputParams      entities.Pagination
		repositoryReturn []entities.PuzzleNode
		expected         *entities.PuzzleConnection
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "unauthenticated"),
			inputParams:      firstPage,
			repositoryReturn: nodes[:9],
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), users[0]),
			inputParams:      firstPage,
			repositoryReturn: []entities.PuzzleNode{},
			expected:         &entities.PuzzleConnection{Edges: []entities.PuzzleEdge{}},
		},
		{
			ctx:              entities.UserNewContext(context.Background(), users[1]),
			inputParams:      firstPage,
			repositoryReturn: nodes[10:20],
			expected:         expectedFirstPage,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), users[2]),
			inputParams:      secondPage,
			repositoryReturn: nodes[21:],
			expected:         expectedSecondPage,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleList
		}

		// Simulate service adding 1 to the limit
		test.inputParams.Limit = test.inputParams.Limit + 1

		repository.EXPECT().
			GetLiked(test.ctx, test.inputParams).
			Return(test.repositoryReturn, err)

		// Decrement by 1 before submitting to service
		test.inputParams.Limit = test.inputParams.Limit - 1

		found, err := service.FindLiked(test.ctx, test.inputParams)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleFindMostLiked(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	users := testutils.GenerateUsers(t, 1)

	nodes := testutils.GeneratePuzzleNodes(t, 31)
	for i := range nodes {
		if i > 9 {
			date := gofakeit.Date()
			nodes[i].LikedAt = &date
			nodes[i].NumOfLikes = uint(gofakeit.Uint64())
		}
	}

	pagination := entities.Pagination{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	expected, err := entities.BuildPuzzleConnection(pagination.Limit, pagination.SortKey, nodes[10:])
	require.NoError(t, err)

	tests := []struct {
		ctx              context.Context
		inputParams      entities.Pagination
		repositoryReturn []entities.PuzzleNode
		expected         *entities.PuzzleConnection
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "no likes"),
			inputParams:      pagination,
			repositoryReturn: nodes[:9],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "empty nodes"),
			inputParams:      pagination,
			repositoryReturn: []entities.PuzzleNode{},
			expected:         &entities.PuzzleConnection{Edges: []entities.PuzzleEdge{}},
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "unauthenticated"),
			inputParams:      pagination,
			repositoryReturn: nodes[10:],
			expected:         expected,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), users[0]),
			inputParams:      pagination,
			repositoryReturn: nodes[10:],
			expected:         expected,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleList
		}

		repository.EXPECT().
			GetMostLiked(test.ctx, test.inputParams).
			Return(test.repositoryReturn, err)

		found, err := service.FindMostLiked(test.ctx)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleFindMostPlayed(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	users := testutils.GenerateUsers(t, 1)

	nodes := testutils.GeneratePuzzleNodes(t, 31)
	for i := range nodes {
		if i > 9 {
			date := gofakeit.Date()
			nodes[i].LikedAt = &date
			nodes[i].NumOfLikes = uint(gofakeit.Uint64())
		}
	}

	pagination := entities.Pagination{
		Cursor:    "",
		Limit:     20,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	firstExpected, err := entities.BuildPuzzleConnection(pagination.Limit, pagination.SortKey, nodes[:9])
	require.NoError(t, err)

	secondExpected, err := entities.BuildPuzzleConnection(pagination.Limit, pagination.SortKey, nodes[10:])
	require.NoError(t, err)

	tests := []struct {
		ctx              context.Context
		inputParams      entities.Pagination
		repositoryReturn []entities.PuzzleNode
		expected         *entities.PuzzleConnection
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "empty nodes"),
			inputParams:      pagination,
			repositoryReturn: []entities.PuzzleNode{},
			expected:         &entities.PuzzleConnection{Edges: []entities.PuzzleEdge{}},
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "unauthenticated"),
			inputParams:      pagination,
			repositoryReturn: nodes[:9],
			expected:         firstExpected,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), users[0]),
			inputParams:      pagination,
			repositoryReturn: nodes[10:],
			expected:         secondExpected,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleList
		}

		repository.EXPECT().
			GetMostPlayed(test.ctx, test.inputParams).
			Return(test.repositoryReturn, err)

		found, err := service.FindMostPlayed(test.ctx)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleFindRecent(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	user := testutils.GenerateUsers(t, 1)[0]

	nodes := testutils.GeneratePuzzleNodes(t, 60)
	for i := range nodes {
		if i < 5 {
			nodes[i].MaxAttempts = 10
		} else if i >= 5 && i < 10 {
			nodes[i].MaxAttempts = 0
		}
		if i >= 10 && i < 15 {
			nodes[i].TimeAllowed = 3600
		} else if i >= 15 && i < 20 {
			nodes[i].TimeAllowed = 0
		}
		if i >= 20 && i < 25 {
			nodes[i].Difficulty = entities.Medium
		}
		if i >= 25 && i < 30 {
			nodes[i].NumOfLikes = 2
		}

		if i > 50 {
			date := gofakeit.Date()
			nodes[i].LikedAt = &date
			nodes[i].NumOfLikes = uint(gofakeit.Uint64())
		}
	}

	firstPage := entities.Pagination{
		Cursor:    "",
		SortKey:   "created_at",
		SortOrder: "DESC",
		Limit:     10,
	}

	cursor, err := entities.NewCursor("createdAt", nodes[41])
	require.NoError(t, err)

	secondPage := entities.Pagination{
		Cursor:    cursor,
		SortKey:   "created_at",
		SortOrder: "DESC",
		Limit:     10,
	}

	expectedFirstPage, err := entities.BuildPuzzleConnection(firstPage.Limit+1, firstPage.SortKey, nodes[30:40])
	require.NoError(t, err)

	expectedSecondPage, err := entities.BuildPuzzleConnection(secondPage.Limit+1, secondPage.SortKey, nodes[41:50])
	require.NoError(t, err)

	expectedAuthenticated, err := entities.BuildPuzzleConnection(firstPage.Limit+1, firstPage.SortKey, nodes[51:])
	require.NoError(t, err)

	isTrue := true
	isFalse := false
	difficulty := entities.Hard
	var numOfLikes uint16 = 5

	tests := []struct {
		ctx              context.Context
		inputParams      entities.Pagination
		inputFilter      entities.PuzzleFilters
		repositoryReturn []entities.PuzzleNode
		expected         *entities.PuzzleConnection
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "incorrect maxAttempts: true"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{CustomizableAttempts: &isTrue},
			repositoryReturn: nodes[:4],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "incorrect maxAttempts: false"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{CustomizableAttempts: &isFalse},
			repositoryReturn: nodes[5:9],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "incorrect timeAllowed: true"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{CustomizableTime: &isTrue},
			repositoryReturn: nodes[10:14],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "incorrect timeAllowed: false"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{CustomizableTime: &isFalse},
			repositoryReturn: nodes[15:19],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "incorrect difficulty"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{Difficulty: &difficulty},
			repositoryReturn: nodes[20:24],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "incorrect numOfLikes"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{NumOfLikes: &numOfLikes},
			repositoryReturn: nodes[25:29],
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "empty nodes"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{},
			repositoryReturn: []entities.PuzzleNode{},
			expected:         &entities.PuzzleConnection{Edges: []entities.PuzzleEdge{}},
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "first page"),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{},
			repositoryReturn: nodes[30:40],
			expected:         expectedFirstPage,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "second page"),
			inputParams:      secondPage,
			inputFilter:      entities.PuzzleFilters{},
			repositoryReturn: nodes[41:50],
			expected:         expectedSecondPage,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), user),
			inputParams:      firstPage,
			inputFilter:      entities.PuzzleFilters{},
			repositoryReturn: nodes[51:],
			expected:         expectedAuthenticated,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleList
		}

		// Simulate service adding 1 to the limit
		test.inputParams.Limit = test.inputParams.Limit + 1

		repository.EXPECT().
			GetRecent(test.ctx, test.inputParams, test.inputFilter).
			Return(test.repositoryReturn, err)

		// Decrement by 1 before submitting to service
		test.inputParams.Limit = test.inputParams.Limit - 1

		found, err := service.FindRecent(test.ctx, test.inputParams, test.inputFilter)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleSearch(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	user := testutils.GenerateUsers(t, 1)[0]

	nodes := testutils.GeneratePuzzleNodes(t, 50)
	for i := range nodes {
		if i > 40 {
			date := gofakeit.Date()
			nodes[i].LikedAt = &date
			nodes[i].NumOfLikes = uint(gofakeit.Uint64())
		}
	}

	pagination := entities.Pagination{
		Cursor:    "",
		Limit:     100,
		SortKey:   "created_at",
		SortOrder: "DESC",
	}

	expectedUnauthenticated, err := entities.BuildPuzzleConnection(pagination.Limit+1, pagination.SortKey, nodes[:24])
	require.NoError(t, err)

	expectedAuthenticated, err := entities.BuildPuzzleConnection(pagination.Limit+1, pagination.SortKey, nodes[25:])
	require.NoError(t, err)

	tests := []struct {
		ctx              context.Context
		inputSearch      string
		repositoryReturn []entities.PuzzleNode
		expected         *entities.PuzzleConnection
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "empty search term"),
			inputSearch:      "",
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "non-alphanumeric character"),
			inputSearch:      ">>",
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			// MySQL freaks out when these characters are passed
			ctx:              context.WithValue(context.Background(), "title", "contains --"),
			inputSearch:      "--",
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              context.WithValue(context.Background(), "title", "unauthenticated"),
			inputSearch:      "test",
			repositoryReturn: nodes[:24],
			expected:         expectedUnauthenticated,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), user),
			inputSearch:      "test",
			repositoryReturn: nodes[25:],
			expected:         expectedAuthenticated,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleList
		}

		repository.EXPECT().
			Search(test.ctx, pagination, test.inputSearch).
			Return(test.repositoryReturn, err)

		found, err := service.Search(test.ctx, test.inputSearch)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleToggleLike(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	users := testutils.GenerateUsers(t, 3)

	puzzles := testutils.GeneratePuzzles(t, 3)

	expected := entities.PuzzleLike{
		ID:        uuid.New(),
		Active:    true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	tests := []struct {
		ctx              context.Context
		inputID          uuid.UUID
		repositoryGet    *entities.Puzzle
		repositoryReturn *entities.PuzzleLike
		expected         *entities.PuzzleLike
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "unauthenticated"),
			inputID:          puzzles[0].ID,
			repositoryGet:    &puzzles[0],
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.WithValue(context.Background(), "title", "not found"), users[0]),
			inputID:          uuid.New(),
			repositoryGet:    nil,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.WithValue(context.Background(), "title", "failed like"), users[1]),
			inputID:          puzzles[1].ID,
			repositoryGet:    &puzzles[1],
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), users[2]),
			inputID:          puzzles[2].ID,
			repositoryGet:    &puzzles[2],
			repositoryReturn: &expected,
			expected:         &expected,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var errGet error
		if test.repositoryGet == nil {
			errGet = services.ErrPuzzleNotFound
		}

		repository.EXPECT().
			Get(test.ctx, test.inputID).
			Return(test.repositoryGet, errGet)

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleLike
		}

		repository.EXPECT().
			ToggleLike(test.ctx, test.inputID).
			Return(test.repositoryReturn, err)

		found, err := service.ToggleLike(test.ctx, test.inputID)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.expected, found)
			assert.NoError(t, err)
		}
	}
}

func TestPuzzleUpdate(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	users := testutils.GenerateUsers(t, 2)

	oldPuzzle := testutils.GeneratePuzzles(t, 1)[0]
	oldPuzzle.CreatedBy = users[0]

	invalidID := oldPuzzle
	invalidID.ID = uuid.New()
	invalidID.Name = gofakeit.Name()

	invalidCreatedBy := oldPuzzle
	invalidCreatedBy.Name = gofakeit.Name()
	invalidCreatedBy.CreatedBy = users[1]

	invalidPuzzle := oldPuzzle
	invalidPuzzle.Name = ">><<"

	now := time.Now()
	updatePuzzle := oldPuzzle
	updatePuzzle.Name = gofakeit.Name()
	updatePuzzle.Description = gofakeit.SentenceSimple()
	updatePuzzle.UpdatedAt = &now

	for i := range updatePuzzle.Groups {
		updatePuzzle.Groups[i].Description = gofakeit.SentenceSimple()
	}

	tests := []struct {
		ctx              context.Context
		inputOldPuzzle   entities.Puzzle
		inputNewPuzzle   entities.Puzzle
		repositoryReturn *entities.Puzzle
		expected         *entities.Puzzle
	}{
		{
			ctx:              context.WithValue(context.Background(), "title", "unauthenticated"),
			inputOldPuzzle:   oldPuzzle,
			inputNewPuzzle:   updatePuzzle,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.WithValue(context.Background(), "title", "invalid id"), users[0]),
			inputOldPuzzle:   oldPuzzle,
			inputNewPuzzle:   invalidID,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.WithValue(context.Background(), "title", "invalid createdBy"), users[0]),
			inputOldPuzzle:   oldPuzzle,
			inputNewPuzzle:   invalidCreatedBy,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.WithValue(context.Background(), "title", "wrong user"), users[1]),
			inputOldPuzzle:   oldPuzzle,
			inputNewPuzzle:   updatePuzzle,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.WithValue(context.Background(), "title", "invalid puzzle"), users[0]),
			inputOldPuzzle:   oldPuzzle,
			inputNewPuzzle:   invalidPuzzle,
			repositoryReturn: nil,
			expected:         nil,
		},
		{
			ctx:              entities.UserNewContext(context.Background(), updatePuzzle.CreatedBy),
			inputOldPuzzle:   oldPuzzle,
			inputNewPuzzle:   updatePuzzle,
			repositoryReturn: &updatePuzzle,
			expected:         &updatePuzzle,
		},
	}

	for _, test := range tests {
		defer test.ctx.Done()

		var err error = nil
		if test.expected == nil {
			err = services.ErrPuzzleUpdate
		}

		repository.EXPECT().
			Update(test.ctx, test.inputNewPuzzle).
			Return(test.repositoryReturn, err)

		found, err := service.Update(test.ctx, test.inputOldPuzzle, test.inputNewPuzzle)
		if test.expected == nil {
			assert.Nil(t, found)
			assert.Error(t, err)
		} else {
			assert.Equal(t, test.inputOldPuzzle.ID, test.inputNewPuzzle.ID)
			assert.Equal(t, test.inputOldPuzzle.MaxAttempts, test.inputNewPuzzle.MaxAttempts)
			assert.Equal(t, test.inputOldPuzzle.TimeAllowed, test.inputNewPuzzle.TimeAllowed)
			assert.Equal(t, test.inputOldPuzzle.CreatedAt, test.inputNewPuzzle.CreatedAt)
			assert.Equal(t, test.inputOldPuzzle.CreatedBy, test.inputNewPuzzle.CreatedBy)

			assert.NotEqual(t, test.inputOldPuzzle.Name, test.inputNewPuzzle.Name)
			assert.NotEqual(t, test.inputOldPuzzle.Description, test.inputNewPuzzle.Description)
			assert.NotEqual(t, test.inputOldPuzzle.UpdatedAt, test.inputNewPuzzle.UpdatedAt)

			assert.NoError(t, err)
		}
	}
}

func TestPuzzleDelete(t *testing.T) {
	repository, service := testutils.SetupPuzzleService(t)

	puzzle := testutils.GeneratePuzzles(t, 1)[0]

	tests := []struct {
		ctx           context.Context
		inputID       uuid.UUID
		repositoryGet *entities.Puzzle
		expected      error
	}{
		{
			ctx:           context.WithValue(context.Background(), "title", "unauthenticated"),
			inputID:       uuid.New(),
			repositoryGet: &testutils.GeneratePuzzles(t, 1)[0],
			expected:      services.ErrPuzzleUnauthenticated,
		},
		{
			ctx:           entities.UserNewContext(context.Background(), testutils.GenerateUsers(t, 1)[0]),
			inputID:       uuid.New(),
			repositoryGet: nil,
			expected:      services.ErrPuzzleNotFound,
		},
		{
			ctx:           entities.UserNewContext(context.Background(), puzzle.CreatedBy),
			inputID:       puzzle.ID,
			repositoryGet: &puzzle,
			expected:      nil,
		},
	}

	for _, test := range tests {
		var errGet error = nil
		if test.repositoryGet == nil {
			errGet = services.ErrPuzzleNotFound
		}

		repository.EXPECT().
			Get(test.ctx, test.inputID).
			Return(test.repositoryGet, errGet)

		repository.EXPECT().
			Delete(test.ctx, test.inputID).
			Return(test.expected)

		err := service.Delete(test.ctx, test.inputID)

		if test.expected == nil {
			assert.NoError(t, err)
		} else {
			assert.Error(t, err)
		}
	}
}

// Code generated by mockery v2.14.0. DO NOT EDIT.

package mocks

import (
	context "context"

	entities "github.com/RagOfJoes/puzzlely/entities"
	mock "github.com/stretchr/testify/mock"

	time "time"

	uuid "github.com/google/uuid"
)

// Puzzle is an autogenerated mock type for the Puzzle type
type Puzzle struct {
	mock.Mock
}

type Puzzle_Expecter struct {
	mock *mock.Mock
}

func (_m *Puzzle) EXPECT() *Puzzle_Expecter {
	return &Puzzle_Expecter{mock: &_m.Mock}
}

// Create provides a mock function with given fields: ctx, newPuzzle
func (_m *Puzzle) Create(ctx context.Context, newPuzzle entities.Puzzle) (*entities.Puzzle, error) {
	ret := _m.Called(ctx, newPuzzle)

	var r0 *entities.Puzzle
	if rf, ok := ret.Get(0).(func(context.Context, entities.Puzzle) *entities.Puzzle); ok {
		r0 = rf(ctx, newPuzzle)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.Puzzle)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Puzzle) error); ok {
		r1 = rf(ctx, newPuzzle)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type Puzzle_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//  - ctx context.Context
//  - newPuzzle entities.Puzzle
func (_e *Puzzle_Expecter) Create(ctx interface{}, newPuzzle interface{}) *Puzzle_Create_Call {
	return &Puzzle_Create_Call{Call: _e.mock.On("Create", ctx, newPuzzle)}
}

func (_c *Puzzle_Create_Call) Run(run func(ctx context.Context, newPuzzle entities.Puzzle)) *Puzzle_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Puzzle))
	})
	return _c
}

func (_c *Puzzle_Create_Call) Return(_a0 *entities.Puzzle, _a1 error) *Puzzle_Create_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// Delete provides a mock function with given fields: ctx, id
func (_m *Puzzle) Delete(ctx context.Context, id uuid.UUID) error {
	ret := _m.Called(ctx, id)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) error); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Puzzle_Delete_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Delete'
type Puzzle_Delete_Call struct {
	*mock.Call
}

// Delete is a helper method to define mock.On call
//  - ctx context.Context
//  - id uuid.UUID
func (_e *Puzzle_Expecter) Delete(ctx interface{}, id interface{}) *Puzzle_Delete_Call {
	return &Puzzle_Delete_Call{Call: _e.mock.On("Delete", ctx, id)}
}

func (_c *Puzzle_Delete_Call) Run(run func(ctx context.Context, id uuid.UUID)) *Puzzle_Delete_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *Puzzle_Delete_Call) Return(_a0 error) *Puzzle_Delete_Call {
	_c.Call.Return(_a0)
	return _c
}

// Get provides a mock function with given fields: ctx, id
func (_m *Puzzle) Get(ctx context.Context, id uuid.UUID) (*entities.Puzzle, error) {
	ret := _m.Called(ctx, id)

	var r0 *entities.Puzzle
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *entities.Puzzle); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.Puzzle)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_Get_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Get'
type Puzzle_Get_Call struct {
	*mock.Call
}

// Get is a helper method to define mock.On call
//  - ctx context.Context
//  - id uuid.UUID
func (_e *Puzzle_Expecter) Get(ctx interface{}, id interface{}) *Puzzle_Get_Call {
	return &Puzzle_Get_Call{Call: _e.mock.On("Get", ctx, id)}
}

func (_c *Puzzle_Get_Call) Run(run func(ctx context.Context, id uuid.UUID)) *Puzzle_Get_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *Puzzle_Get_Call) Return(_a0 *entities.Puzzle, _a1 error) *Puzzle_Get_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetCreated provides a mock function with given fields: ctx, params, userID
func (_m *Puzzle) GetCreated(ctx context.Context, params entities.Pagination, userID uuid.UUID) ([]entities.PuzzleNode, error) {
	ret := _m.Called(ctx, params, userID)

	var r0 []entities.PuzzleNode
	if rf, ok := ret.Get(0).(func(context.Context, entities.Pagination, uuid.UUID) []entities.PuzzleNode); ok {
		r0 = rf(ctx, params, userID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]entities.PuzzleNode)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Pagination, uuid.UUID) error); ok {
		r1 = rf(ctx, params, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_GetCreated_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetCreated'
type Puzzle_GetCreated_Call struct {
	*mock.Call
}

// GetCreated is a helper method to define mock.On call
//  - ctx context.Context
//  - params entities.Pagination
//  - userID uuid.UUID
func (_e *Puzzle_Expecter) GetCreated(ctx interface{}, params interface{}, userID interface{}) *Puzzle_GetCreated_Call {
	return &Puzzle_GetCreated_Call{Call: _e.mock.On("GetCreated", ctx, params, userID)}
}

func (_c *Puzzle_GetCreated_Call) Run(run func(ctx context.Context, params entities.Pagination, userID uuid.UUID)) *Puzzle_GetCreated_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Pagination), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *Puzzle_GetCreated_Call) Return(_a0 []entities.PuzzleNode, _a1 error) *Puzzle_GetCreated_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetLiked provides a mock function with given fields: ctx, params
func (_m *Puzzle) GetLiked(ctx context.Context, params entities.Pagination) ([]entities.PuzzleNode, error) {
	ret := _m.Called(ctx, params)

	var r0 []entities.PuzzleNode
	if rf, ok := ret.Get(0).(func(context.Context, entities.Pagination) []entities.PuzzleNode); ok {
		r0 = rf(ctx, params)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]entities.PuzzleNode)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Pagination) error); ok {
		r1 = rf(ctx, params)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_GetLiked_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetLiked'
type Puzzle_GetLiked_Call struct {
	*mock.Call
}

// GetLiked is a helper method to define mock.On call
//  - ctx context.Context
//  - params entities.Pagination
func (_e *Puzzle_Expecter) GetLiked(ctx interface{}, params interface{}) *Puzzle_GetLiked_Call {
	return &Puzzle_GetLiked_Call{Call: _e.mock.On("GetLiked", ctx, params)}
}

func (_c *Puzzle_GetLiked_Call) Run(run func(ctx context.Context, params entities.Pagination)) *Puzzle_GetLiked_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Pagination))
	})
	return _c
}

func (_c *Puzzle_GetLiked_Call) Return(_a0 []entities.PuzzleNode, _a1 error) *Puzzle_GetLiked_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetLikedAt provides a mock function with given fields: ctx, ids
func (_m *Puzzle) GetLikedAt(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]*time.Time, error) {
	ret := _m.Called(ctx, ids)

	var r0 map[uuid.UUID]*time.Time
	if rf, ok := ret.Get(0).(func(context.Context, []uuid.UUID) map[uuid.UUID]*time.Time); ok {
		r0 = rf(ctx, ids)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[uuid.UUID]*time.Time)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, []uuid.UUID) error); ok {
		r1 = rf(ctx, ids)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_GetLikedAt_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetLikedAt'
type Puzzle_GetLikedAt_Call struct {
	*mock.Call
}

// GetLikedAt is a helper method to define mock.On call
//  - ctx context.Context
//  - ids []uuid.UUID
func (_e *Puzzle_Expecter) GetLikedAt(ctx interface{}, ids interface{}) *Puzzle_GetLikedAt_Call {
	return &Puzzle_GetLikedAt_Call{Call: _e.mock.On("GetLikedAt", ctx, ids)}
}

func (_c *Puzzle_GetLikedAt_Call) Run(run func(ctx context.Context, ids []uuid.UUID)) *Puzzle_GetLikedAt_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].([]uuid.UUID))
	})
	return _c
}

func (_c *Puzzle_GetLikedAt_Call) Return(_a0 map[uuid.UUID]*time.Time, _a1 error) *Puzzle_GetLikedAt_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetMostLiked provides a mock function with given fields: ctx, params
func (_m *Puzzle) GetMostLiked(ctx context.Context, params entities.Pagination) ([]entities.PuzzleNode, error) {
	ret := _m.Called(ctx, params)

	var r0 []entities.PuzzleNode
	if rf, ok := ret.Get(0).(func(context.Context, entities.Pagination) []entities.PuzzleNode); ok {
		r0 = rf(ctx, params)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]entities.PuzzleNode)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Pagination) error); ok {
		r1 = rf(ctx, params)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_GetMostLiked_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetMostLiked'
type Puzzle_GetMostLiked_Call struct {
	*mock.Call
}

// GetMostLiked is a helper method to define mock.On call
//  - ctx context.Context
//  - params entities.Pagination
func (_e *Puzzle_Expecter) GetMostLiked(ctx interface{}, params interface{}) *Puzzle_GetMostLiked_Call {
	return &Puzzle_GetMostLiked_Call{Call: _e.mock.On("GetMostLiked", ctx, params)}
}

func (_c *Puzzle_GetMostLiked_Call) Run(run func(ctx context.Context, params entities.Pagination)) *Puzzle_GetMostLiked_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Pagination))
	})
	return _c
}

func (_c *Puzzle_GetMostLiked_Call) Return(_a0 []entities.PuzzleNode, _a1 error) *Puzzle_GetMostLiked_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetMostPlayed provides a mock function with given fields: ctx, params
func (_m *Puzzle) GetMostPlayed(ctx context.Context, params entities.Pagination) ([]entities.PuzzleNode, error) {
	ret := _m.Called(ctx, params)

	var r0 []entities.PuzzleNode
	if rf, ok := ret.Get(0).(func(context.Context, entities.Pagination) []entities.PuzzleNode); ok {
		r0 = rf(ctx, params)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]entities.PuzzleNode)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Pagination) error); ok {
		r1 = rf(ctx, params)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_GetMostPlayed_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetMostPlayed'
type Puzzle_GetMostPlayed_Call struct {
	*mock.Call
}

// GetMostPlayed is a helper method to define mock.On call
//  - ctx context.Context
//  - params entities.Pagination
func (_e *Puzzle_Expecter) GetMostPlayed(ctx interface{}, params interface{}) *Puzzle_GetMostPlayed_Call {
	return &Puzzle_GetMostPlayed_Call{Call: _e.mock.On("GetMostPlayed", ctx, params)}
}

func (_c *Puzzle_GetMostPlayed_Call) Run(run func(ctx context.Context, params entities.Pagination)) *Puzzle_GetMostPlayed_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Pagination))
	})
	return _c
}

func (_c *Puzzle_GetMostPlayed_Call) Return(_a0 []entities.PuzzleNode, _a1 error) *Puzzle_GetMostPlayed_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetRecent provides a mock function with given fields: ctx, params, filters
func (_m *Puzzle) GetRecent(ctx context.Context, params entities.Pagination, filters entities.PuzzleFilters) ([]entities.PuzzleNode, error) {
	ret := _m.Called(ctx, params, filters)

	var r0 []entities.PuzzleNode
	if rf, ok := ret.Get(0).(func(context.Context, entities.Pagination, entities.PuzzleFilters) []entities.PuzzleNode); ok {
		r0 = rf(ctx, params, filters)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]entities.PuzzleNode)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Pagination, entities.PuzzleFilters) error); ok {
		r1 = rf(ctx, params, filters)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_GetRecent_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetRecent'
type Puzzle_GetRecent_Call struct {
	*mock.Call
}

// GetRecent is a helper method to define mock.On call
//  - ctx context.Context
//  - params entities.Pagination
//  - filters entities.PuzzleFilters
func (_e *Puzzle_Expecter) GetRecent(ctx interface{}, params interface{}, filters interface{}) *Puzzle_GetRecent_Call {
	return &Puzzle_GetRecent_Call{Call: _e.mock.On("GetRecent", ctx, params, filters)}
}

func (_c *Puzzle_GetRecent_Call) Run(run func(ctx context.Context, params entities.Pagination, filters entities.PuzzleFilters)) *Puzzle_GetRecent_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Pagination), args[2].(entities.PuzzleFilters))
	})
	return _c
}

func (_c *Puzzle_GetRecent_Call) Return(_a0 []entities.PuzzleNode, _a1 error) *Puzzle_GetRecent_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// Search provides a mock function with given fields: ctx, params, search
func (_m *Puzzle) Search(ctx context.Context, params entities.Pagination, search string) ([]entities.PuzzleNode, error) {
	ret := _m.Called(ctx, params, search)

	var r0 []entities.PuzzleNode
	if rf, ok := ret.Get(0).(func(context.Context, entities.Pagination, string) []entities.PuzzleNode); ok {
		r0 = rf(ctx, params, search)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]entities.PuzzleNode)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Pagination, string) error); ok {
		r1 = rf(ctx, params, search)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_Search_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Search'
type Puzzle_Search_Call struct {
	*mock.Call
}

// Search is a helper method to define mock.On call
//  - ctx context.Context
//  - params entities.Pagination
//  - search string
func (_e *Puzzle_Expecter) Search(ctx interface{}, params interface{}, search interface{}) *Puzzle_Search_Call {
	return &Puzzle_Search_Call{Call: _e.mock.On("Search", ctx, params, search)}
}

func (_c *Puzzle_Search_Call) Run(run func(ctx context.Context, params entities.Pagination, search string)) *Puzzle_Search_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Pagination), args[2].(string))
	})
	return _c
}

func (_c *Puzzle_Search_Call) Return(_a0 []entities.PuzzleNode, _a1 error) *Puzzle_Search_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// ToggleLike provides a mock function with given fields: ctx, id
func (_m *Puzzle) ToggleLike(ctx context.Context, id uuid.UUID) (*entities.PuzzleLike, error) {
	ret := _m.Called(ctx, id)

	var r0 *entities.PuzzleLike
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *entities.PuzzleLike); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.PuzzleLike)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_ToggleLike_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'ToggleLike'
type Puzzle_ToggleLike_Call struct {
	*mock.Call
}

// ToggleLike is a helper method to define mock.On call
//  - ctx context.Context
//  - id uuid.UUID
func (_e *Puzzle_Expecter) ToggleLike(ctx interface{}, id interface{}) *Puzzle_ToggleLike_Call {
	return &Puzzle_ToggleLike_Call{Call: _e.mock.On("ToggleLike", ctx, id)}
}

func (_c *Puzzle_ToggleLike_Call) Run(run func(ctx context.Context, id uuid.UUID)) *Puzzle_ToggleLike_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *Puzzle_ToggleLike_Call) Return(_a0 *entities.PuzzleLike, _a1 error) *Puzzle_ToggleLike_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// Update provides a mock function with given fields: ctx, updatePuzzle
func (_m *Puzzle) Update(ctx context.Context, updatePuzzle entities.Puzzle) (*entities.Puzzle, error) {
	ret := _m.Called(ctx, updatePuzzle)

	var r0 *entities.Puzzle
	if rf, ok := ret.Get(0).(func(context.Context, entities.Puzzle) *entities.Puzzle); ok {
		r0 = rf(ctx, updatePuzzle)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.Puzzle)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Puzzle) error); ok {
		r1 = rf(ctx, updatePuzzle)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Puzzle_Update_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Update'
type Puzzle_Update_Call struct {
	*mock.Call
}

// Update is a helper method to define mock.On call
//  - ctx context.Context
//  - updatePuzzle entities.Puzzle
func (_e *Puzzle_Expecter) Update(ctx interface{}, updatePuzzle interface{}) *Puzzle_Update_Call {
	return &Puzzle_Update_Call{Call: _e.mock.On("Update", ctx, updatePuzzle)}
}

func (_c *Puzzle_Update_Call) Run(run func(ctx context.Context, updatePuzzle entities.Puzzle)) *Puzzle_Update_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Puzzle))
	})
	return _c
}

func (_c *Puzzle_Update_Call) Return(_a0 *entities.Puzzle, _a1 error) *Puzzle_Update_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

type mockConstructorTestingTNewPuzzle interface {
	mock.TestingT
	Cleanup(func())
}

// NewPuzzle creates a new instance of Puzzle. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewPuzzle(t mockConstructorTestingTNewPuzzle) *Puzzle {
	mock := &Puzzle{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}

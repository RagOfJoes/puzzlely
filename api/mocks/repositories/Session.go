// Code generated by mockery v2.14.0. DO NOT EDIT.

package mocks

import (
	context "context"

	entities "github.com/RagOfJoes/puzzlely/entities"
	mock "github.com/stretchr/testify/mock"

	uuid "github.com/google/uuid"
)

// Session is an autogenerated mock type for the Session type
type Session struct {
	mock.Mock
}

type Session_Expecter struct {
	mock *mock.Mock
}

func (_m *Session) EXPECT() *Session_Expecter {
	return &Session_Expecter{mock: &_m.Mock}
}

// Create provides a mock function with given fields: ctx, newSession
func (_m *Session) Create(ctx context.Context, newSession entities.Session) (*entities.Session, error) {
	ret := _m.Called(ctx, newSession)

	var r0 *entities.Session
	if rf, ok := ret.Get(0).(func(context.Context, entities.Session) *entities.Session); ok {
		r0 = rf(ctx, newSession)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.Session)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Session) error); ok {
		r1 = rf(ctx, newSession)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Session_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type Session_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//  - ctx context.Context
//  - newSession entities.Session
func (_e *Session_Expecter) Create(ctx interface{}, newSession interface{}) *Session_Create_Call {
	return &Session_Create_Call{Call: _e.mock.On("Create", ctx, newSession)}
}

func (_c *Session_Create_Call) Run(run func(ctx context.Context, newSession entities.Session)) *Session_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Session))
	})
	return _c
}

func (_c *Session_Create_Call) Return(_a0 *entities.Session, _a1 error) *Session_Create_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// Delete provides a mock function with given fields: ctx, id
func (_m *Session) Delete(ctx context.Context, id uuid.UUID) error {
	ret := _m.Called(ctx, id)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) error); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Session_Delete_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Delete'
type Session_Delete_Call struct {
	*mock.Call
}

// Delete is a helper method to define mock.On call
//  - ctx context.Context
//  - id uuid.UUID
func (_e *Session_Expecter) Delete(ctx interface{}, id interface{}) *Session_Delete_Call {
	return &Session_Delete_Call{Call: _e.mock.On("Delete", ctx, id)}
}

func (_c *Session_Delete_Call) Run(run func(ctx context.Context, id uuid.UUID)) *Session_Delete_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *Session_Delete_Call) Return(_a0 error) *Session_Delete_Call {
	_c.Call.Return(_a0)
	return _c
}

// Get provides a mock function with given fields: ctx, id
func (_m *Session) Get(ctx context.Context, id uuid.UUID) (*entities.Session, error) {
	ret := _m.Called(ctx, id)

	var r0 *entities.Session
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *entities.Session); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.Session)
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

// Session_Get_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Get'
type Session_Get_Call struct {
	*mock.Call
}

// Get is a helper method to define mock.On call
//  - ctx context.Context
//  - id uuid.UUID
func (_e *Session_Expecter) Get(ctx interface{}, id interface{}) *Session_Get_Call {
	return &Session_Get_Call{Call: _e.mock.On("Get", ctx, id)}
}

func (_c *Session_Get_Call) Run(run func(ctx context.Context, id uuid.UUID)) *Session_Get_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *Session_Get_Call) Return(_a0 *entities.Session, _a1 error) *Session_Get_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// GetWithToken provides a mock function with given fields: ctx, token
func (_m *Session) GetWithToken(ctx context.Context, token string) (*entities.Session, error) {
	ret := _m.Called(ctx, token)

	var r0 *entities.Session
	if rf, ok := ret.Get(0).(func(context.Context, string) *entities.Session); ok {
		r0 = rf(ctx, token)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.Session)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, token)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Session_GetWithToken_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetWithToken'
type Session_GetWithToken_Call struct {
	*mock.Call
}

// GetWithToken is a helper method to define mock.On call
//  - ctx context.Context
//  - token string
func (_e *Session_Expecter) GetWithToken(ctx interface{}, token interface{}) *Session_GetWithToken_Call {
	return &Session_GetWithToken_Call{Call: _e.mock.On("GetWithToken", ctx, token)}
}

func (_c *Session_GetWithToken_Call) Run(run func(ctx context.Context, token string)) *Session_GetWithToken_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(string))
	})
	return _c
}

func (_c *Session_GetWithToken_Call) Return(_a0 *entities.Session, _a1 error) *Session_GetWithToken_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

// Update provides a mock function with given fields: ctx, updateSession
func (_m *Session) Update(ctx context.Context, updateSession entities.Session) (*entities.Session, error) {
	ret := _m.Called(ctx, updateSession)

	var r0 *entities.Session
	if rf, ok := ret.Get(0).(func(context.Context, entities.Session) *entities.Session); ok {
		r0 = rf(ctx, updateSession)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entities.Session)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, entities.Session) error); ok {
		r1 = rf(ctx, updateSession)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Session_Update_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Update'
type Session_Update_Call struct {
	*mock.Call
}

// Update is a helper method to define mock.On call
//  - ctx context.Context
//  - updateSession entities.Session
func (_e *Session_Expecter) Update(ctx interface{}, updateSession interface{}) *Session_Update_Call {
	return &Session_Update_Call{Call: _e.mock.On("Update", ctx, updateSession)}
}

func (_c *Session_Update_Call) Run(run func(ctx context.Context, updateSession entities.Session)) *Session_Update_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(entities.Session))
	})
	return _c
}

func (_c *Session_Update_Call) Return(_a0 *entities.Session, _a1 error) *Session_Update_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

type mockConstructorTestingTNewSession interface {
	mock.TestingT
	Cleanup(func())
}

// NewSession creates a new instance of Session. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewSession(t mockConstructorTestingTNewSession) *Session {
	mock := &Session{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}

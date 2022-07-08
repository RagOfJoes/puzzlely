package mysql

import (
	"time"

	"github.com/RagOfJoes/puzzlely/user"
	"github.com/google/uuid"
)

type Connection struct {
	ID       uuid.UUID `db:"id"`
	Provider string    `db:"provider"`
	Sub      string    `db:"sub"`
	UserID   uuid.UUID `db:"user_id"`
}

func fromConnectionEntity(e user.Connection, id uuid.UUID) Connection {
	return Connection{
		ID:       e.ID,
		Provider: e.Provider,
		Sub:      e.Sub,
		UserID:   id,
	}
}

func (m *Connection) ToEntity() user.Connection {
	return user.Connection{
		ID:       m.ID,
		Provider: m.Provider,
		Sub:      m.Sub,
	}
}

type User struct {
	ID        uuid.UUID  `db:"id"`
	State     string     `db:"state"`
	Username  string     `db:"username"`
	CreatedAt time.Time  `db:"created_at"`
	UpdatedAt *time.Time `db:"updated_at"`
}

func fromUserEntity(entity user.User) User {
	return User{
		ID:        entity.ID,
		State:     string(entity.State),
		Username:  entity.Username,
		CreatedAt: entity.CreatedAt,
		UpdatedAt: entity.UpdatedAt,
	}
}

func (m *User) ToEntity() user.User {
	return user.User{
		ID:        m.ID,
		State:     user.State(m.State),
		Username:  m.Username,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}

type Stats struct {
	GamesPlayed    int `db:"games_played"`
	PuzzlesCreated int `db:"puzzles_created"`
	PuzzlesLiked   int `db:"puzzles_liked"`
}

func (m *Stats) ToEntity() user.Stats {
	return user.Stats{
		GamesPlayed:    m.GamesPlayed,
		PuzzlesCreated: m.PuzzlesCreated,
		PuzzlesLiked:   m.PuzzlesLiked,
	}
}

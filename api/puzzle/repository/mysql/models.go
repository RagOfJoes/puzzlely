package mysql

import (
	"time"

	"github.com/RagOfJoes/puzzlely/puzzle"
	"github.com/google/uuid"
)

type Block struct {
	ID      uuid.UUID `db:"id"`
	Value   string    `db:"value"`
	GroupID uuid.UUID `db:"puzzle_group_id"`
}

func fromBlockEntity(entity puzzle.Block, id uuid.UUID) Block {
	return Block{
		ID:      entity.ID,
		Value:   entity.Value,
		GroupID: entity.GroupID,
	}
}

func (m *Block) ToEntity() puzzle.Block {
	return puzzle.Block{
		ID:      m.ID,
		Value:   m.Value,
		GroupID: m.GroupID,
	}
}

type Group struct {
	ID          uuid.UUID `db:"id"`
	Description string    `db:"description"`
	PuzzleID    uuid.UUID `db:"puzzle_id"`
}

func fromGroupEntity(entity puzzle.Group, id uuid.UUID) Group {
	return Group{
		ID:          entity.ID,
		Description: entity.Description,
		PuzzleID:    id,
	}
}

func (m *Group) ToEntity() puzzle.Group {
	return puzzle.Group{
		ID:          m.ID,
		Description: m.Description,
	}
}

type GroupAnswer struct {
	ID            uuid.UUID `db:"id"`
	Answer        string    `db:"answer"`
	PuzzleGroupID uuid.UUID `db:"puzzle_group_id"`
}

type Puzzle struct {
	ID          uuid.UUID  `db:"id"`
	Name        string     `db:"name"`
	Description string     `db:"description"`
	Difficulty  string     `db:"difficulty"`
	MaxAttempts uint16     `db:"max_attempts"`
	TimeAllowed uint32     `db:"time_allowed"`
	CreatedAt   time.Time  `db:"created_at"`
	UpdatedAt   *time.Time `db:"updated_at"`
	UserID      uuid.UUID  `db:"user_id"`
}

func fromEntity(entity puzzle.Puzzle) Puzzle {
	return Puzzle{
		ID:          entity.ID,
		Name:        entity.Name,
		Difficulty:  string(entity.Difficulty),
		Description: entity.Description,
		MaxAttempts: entity.MaxAttempts,
		TimeAllowed: entity.TimeAllowed,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
		UserID:      entity.CreatedBy.ID,
	}
}

func (m *Puzzle) ToEntity() puzzle.Puzzle {
	return puzzle.Puzzle{
		ID:          m.ID,
		Name:        m.Name,
		Difficulty:  puzzle.Difficulty(m.Difficulty),
		Description: m.Description,
		MaxAttempts: m.MaxAttempts,
		TimeAllowed: m.TimeAllowed,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

func (m *Puzzle) ToNodeEntity() puzzle.Node {
	return puzzle.Node{
		ID:          m.ID,
		Name:        m.Name,
		Difficulty:  puzzle.Difficulty(m.Difficulty),
		Description: m.Description,
		MaxAttempts: m.MaxAttempts,
		TimeAllowed: m.TimeAllowed,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

type Like struct {
	ID        uuid.UUID  `db:"id"`
	Active    bool       `db:"active"`
	CreatedAt time.Time  `db:"created_at"`
	UpdatedAt *time.Time `db:"updated_at"`
	PuzzleID  uuid.UUID  `db:"puzzle_id"`
	UserID    uuid.UUID  `db:"user_id"`
}

func (m *Like) ToEntity() puzzle.Like {
	return puzzle.Like{
		ID:        m.ID,
		Active:    m.Active,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}

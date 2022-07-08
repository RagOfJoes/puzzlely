package mysql

import (
	"database/sql"
	"time"

	"github.com/RagOfJoes/puzzlely/game"
	"github.com/google/uuid"
)

type Config struct {
	ID          uuid.UUID     `db:"id"`
	MaxAttempts sql.NullInt16 `db:"max_attempts"`
	TimeAllowed sql.NullInt32 `db:"time_allowed"`
	GameID      uuid.UUID     `db:"game_id"`
}

type Attempt struct {
	ID            uuid.UUID     `db:"id"`
	Order         sql.NullInt16 `db:"order"`
	PuzzleBlockID uuid.UUID     `db:"puzzle_block_id"`
	GameID        uuid.UUID     `db:"game_id"`
}

type Correct struct {
	ID            uuid.UUID `db:"id"`
	PuzzleGroupID uuid.UUID `db:"puzzle_group_id"`
	GameID        uuid.UUID `db:"game_id"`
}

type Result struct {
	ID            uuid.UUID      `db:"id"`
	Guess         sql.NullString `db:"guess"`
	Correct       sql.NullBool   `db:"correct"`
	GameID        uuid.UUID      `db:"game_id"`
	PuzzleGroupID uuid.UUID      `db:"puzzle_group_id"`
}

func (r *Result) toEntity() game.Result {
	return game.Result{
		Guess:         r.Guess.String,
		Correct:       r.Correct.Bool,
		PuzzleGroupID: r.PuzzleGroupID,
	}
}

type Game struct {
	ID            uuid.UUID  `db:"id"`
	Score         uint8      `db:"score"`
	ChallengeCode string     `db:"challenge_code"`
	CreatedAt     time.Time  `db:"created_at"`
	StartedAt     *time.Time `db:"started_at"`
	GuessedAt     *time.Time `db:"guessed_at"`
	CompletedAt   *time.Time `db:"completed_at"`
	ChallengedBy  *uuid.UUID `db:"challenged_by"`
	PuzzleID      uuid.UUID  `db:"puzzle_id"`
	UserID        *uuid.UUID `db:"user_id"`
}

func fromEntity(entity game.Game) Game {
	var challengedBy *uuid.UUID
	if entity.ChallengedBy != nil {
		challengedBy = &entity.ChallengedBy.ID
	}
	var userID *uuid.UUID
	if entity.User != nil {
		userID = &entity.User.ID
	}

	return Game{
		ID:            entity.ID,
		Score:         entity.Score,
		ChallengeCode: entity.ChallengeCode,
		CreatedAt:     entity.CreatedAt,
		StartedAt:     entity.StartedAt,
		GuessedAt:     entity.GuessedAt,
		CompletedAt:   entity.CompletedAt,
		ChallengedBy:  challengedBy,
		PuzzleID:      entity.Puzzle.ID,
		UserID:        userID,
	}
}

func (g *Game) ToEntity() game.Game {
	return game.Game{
		ID:            g.ID,
		Score:         g.Score,
		Attempts:      [][]uuid.UUID{},
		Results:       []game.Result{},
		ChallengeCode: g.ChallengeCode,
		CreatedAt:     g.CreatedAt,
		StartedAt:     g.StartedAt,
		GuessedAt:     g.GuessedAt,
		CompletedAt:   g.CompletedAt,
	}
}

func (g *Game) ToNodeEntity() game.Node {
	return game.Node{
		ID:            g.ID,
		Score:         g.Score,
		Attempts:      0,
		ChallengeCode: g.ChallengeCode,
		CreatedAt:     g.CreatedAt,
		StartedAt:     g.StartedAt,
		GuessedAt:     g.GuessedAt,
		CompletedAt:   g.CompletedAt,
	}
}

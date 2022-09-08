package testutils

import (
	"testing"
	"time"

	"github.com/RagOfJoes/puzzlely/entities"
	"github.com/RagOfJoes/puzzlely/internal/config"
	mocks "github.com/RagOfJoes/puzzlely/mocks/repositories"
	"github.com/RagOfJoes/puzzlely/models"
	"github.com/RagOfJoes/puzzlely/payloads"
	"github.com/RagOfJoes/puzzlely/services"
	"github.com/brianvoe/gofakeit/v6"
	"github.com/google/uuid"
)

// GeneratePuzzleDifficulty creates a random puzzle difficulty
func GeneratePuzzleDifficulty(t *testing.T) entities.PuzzleDifficulty {
	t.Helper()

	return entities.PuzzleDifficulty(gofakeit.RandomString([]string{string(entities.Easy), string(entities.Medium), string(entities.Hard)}))
}

// GeneratePuzzleModels creates n number of test puzzle models
func GeneratePuzzleModels(t *testing.T, n int) []models.Puzzle {
	t.Helper()

	puzzles := make([]models.Puzzle, 0, n)
	users := GenerateUsers(t, n)

	for i := 0; i < n; i++ {
		name := gofakeit.AppName()
		description := gofakeit.SentenceSimple()
		difficulty := GeneratePuzzleDifficulty(t)
		var maxAttempts uint16 = uint16(gofakeit.Number(0, 99))
		var timeAllowed uint32 = uint32(gofakeit.Number(0, 3599000))

		puzzles = append(puzzles, models.Puzzle{
			Base: models.Base{
				ID:        uuid.New(),
				CreatedAt: gofakeit.Date(),
			},

			Name:        name,
			Description: description,
			Difficulty:  string(difficulty),
			MaxAttempts: maxAttempts,
			TimeAllowed: timeAllowed,
			UserID:      users[i].ID,
		})
	}

	return puzzles
}

func GenerateCreatePuzzlePayloads(t *testing.T, n int) []payloads.CreatePuzzle {
	t.Helper()

	puzzles := make([]payloads.CreatePuzzle, 0, n)

	for i := 0; i < n; i++ {
		name := gofakeit.AppName()
		description := gofakeit.SentenceSimple()
		difficulty := GeneratePuzzleDifficulty(t)
		var maxAttempts uint16 = uint16(gofakeit.Number(0, 99))
		var timeAllowed uint32 = uint32(gofakeit.Number(0, 3599000))

		blocks := make([]payloads.CreatePuzzleBlock, 0, 16)
		for j := 0; j < 16; j++ {
			block := payloads.CreatePuzzleBlock{
				Value: gofakeit.Noun(),
			}
			blocks = append(blocks, block)
		}
		size := 4
		groups := make([]payloads.CreatePuzzleGroup, 0, size)
		for j := 0; j < size; j++ {
			description := gofakeit.SentenceSimple()
			answers := []string{gofakeit.Noun()}

			batch := make([]payloads.CreatePuzzleBlock, 0, size)
			batch = append(batch, blocks[0:size:size]...)
			blocks = blocks[size:]

			group := payloads.CreatePuzzleGroup{
				Answers:     answers,
				Description: description,
				Blocks:      batch,
			}
			groups = append(groups, group)
		}

		puzzles = append(puzzles, payloads.CreatePuzzle{
			Name:        name,
			Description: description,
			Difficulty:  entities.PuzzleDifficulty(difficulty),
			MaxAttempts: maxAttempts,
			TimeAllowed: timeAllowed,

			Groups: groups,
		})
	}

	return puzzles
}

func GenerateUpdatePuzzlePayloads(t *testing.T, n int) []payloads.UpdatePuzzle {
	t.Helper()

	puzzles := make([]payloads.UpdatePuzzle, 0, n)

	for i := 0; i < n; i++ {
		name := gofakeit.AppName()
		description := gofakeit.SentenceSimple()
		difficulty := GeneratePuzzleDifficulty(t)

		size := 4
		groups := make([]payloads.UpdatePuzzleGroup, 0, size)
		for j := 0; j < size; j++ {
			description := gofakeit.SentenceSimple()

			group := payloads.UpdatePuzzleGroup{
				ID:          uuid.New(),
				Description: description,
			}
			groups = append(groups, group)
		}

		puzzles = append(puzzles, payloads.UpdatePuzzle{
			Name:        name,
			Description: description,
			Difficulty:  difficulty,

			Groups: groups,
		})
	}

	return puzzles
}

// GeneratePuzzles creates n number of test puzzle entities
func GeneratePuzzles(t *testing.T, n int) []entities.Puzzle {
	t.Helper()

	puzzles := make([]entities.Puzzle, 0, n)
	users := GenerateUsers(t, n)

	for i := 0; i < n; i++ {
		name := gofakeit.AppName()
		description := gofakeit.SentenceSimple()
		difficulty := GeneratePuzzleDifficulty(t)
		var maxAttempts uint16 = uint16(gofakeit.Number(0, 99))
		var timeAllowed uint32 = uint32(gofakeit.Number(0, 3599000))

		blocks := make([]entities.PuzzleBlock, 0, 16)
		for j := 0; j < 16; j++ {
			block := entities.NewBlock(gofakeit.Noun(), uuid.Nil)
			blocks = append(blocks, block)
		}
		size := 4
		groups := make([]entities.PuzzleGroup, 0, size)
		for j := 0; j < size; j++ {
			description := gofakeit.SentenceSimple()
			answers := []string{gofakeit.Noun()}

			batch := make([]entities.PuzzleBlock, 0, size)
			batch = append(batch, blocks[0:size:size]...)
			blocks = blocks[size:]

			group := entities.NewGroup(description, answers, batch)
			groups = append(groups, group)
		}

		puzzles = append(puzzles, entities.NewPuzzle(name, description, difficulty, maxAttempts, timeAllowed, groups, users[i]))
	}

	return puzzles
}

// GeneratePuzzleNodes creates n number of test puzzle node entities
func GeneratePuzzleNodes(t *testing.T, n int) []entities.PuzzleNode {
	t.Helper()

	nodes := make([]entities.PuzzleNode, 0, n)
	users := GenerateUsers(t, n)

	for i := 0; i < n; i++ {
		name := gofakeit.AppName()
		description := gofakeit.SentenceSimple()
		difficulty := GeneratePuzzleDifficulty(t)
		var maxAttempts uint16 = uint16(gofakeit.Number(0, 99))
		var timeAllowed uint32 = uint32(gofakeit.Number(0, 3599000))

		node := entities.PuzzleNode{
			Base: entities.Base{
				ID:        uuid.New(),
				CreatedAt: time.Now(),
			},

			Name:        name,
			Description: description,
			Difficulty:  difficulty,
			MaxAttempts: maxAttempts,
			TimeAllowed: timeAllowed,
			CreatedBy:   users[i],
		}
		nodes = append(nodes, node)
	}

	return nodes
}

// SetupPuzzleService creates a puzzle service for testing
func SetupPuzzleService(t *testing.T) (*mocks.Puzzle, services.Puzzle) {
	t.Helper()

	cfg := config.Configuration{}
	repository := &mocks.Puzzle{}

	service := services.NewPuzzle(cfg, repository)

	return repository, service
}

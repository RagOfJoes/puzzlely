package mysql

import (
	"context"

	"github.com/RagOfJoes/puzzlely/domains"
	"github.com/RagOfJoes/puzzlely/repositories"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

var _ repositories.Session = (*session)(nil)

type session struct {
	db *bun.DB
}

// NewSession creates a new MySQL session repository
func NewSession(db *bun.DB) repositories.Session {
	logrus.Info("Created Session MySQL Repository")

	return &session{
		db: db,
	}
}

func (s *session) Create(ctx context.Context, newSession domains.Session) (*domains.Session, error) {
	if _, err := s.db.NewInsert().Model(&newSession).Exec(ctx); err != nil {
		return nil, err
	}

	return &newSession, nil
}

func (s *session) Get(ctx context.Context, id string) (*domains.Session, error) {
	var foundSession domains.Session

	if err := s.db.NewSelect().
		Model(&foundSession).
		Where("`session`.id = ?", id).
		Relation("User").
		Scan(ctx); err != nil {
		return nil, err
	}

	return &foundSession, nil
}

func (s *session) Update(ctx context.Context, updateSession domains.Session) (*domains.Session, error) {
	if _, err := s.db.NewUpdate().Model(&updateSession).WherePK().Exec(ctx); err != nil {
		return nil, err
	}

	return &updateSession, nil
}

func (s *session) Delete(ctx context.Context, id string) error {
	if _, err := s.db.NewDelete().Model(&domains.Session{}).Where("id = ?", id).Exec(ctx); err != nil {
		return err
	}

	return nil
}

-- Puzzles --
CREATE TABLE puzzles (
  id VARCHAR(26) NOT NULL,
  difficulty VARCHAR(12) NOT NULL,
  max_attempts SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  user_id VARCHAR(26) NOT NULL REFERENCES users (id),
  PRIMARY KEY(id)
);
CREATE INDEX puzzles_idx ON puzzles (user_id, deleted_at, created_at, updated_at);

-- Groups --
CREATE TABLE puzzle_groups (
  id VARCHAR(26) NOT NULL,
  description TEXT,
  puzzle_id VARCHAR(26) NOT NULL REFERENCES puzzles (id),
  PRIMARY KEY(id)
);
CREATE INDEX puzzle_groups_idx ON puzzle_groups_idx (puzzle_id);

-- Blocks --
CREATE TABLE puzzle_blocks(
  id VARCHAR(26) NOT NULL,
  value VARCHAR(48) NOT NULL,
  puzzle_group_id VARCHAR(26) NOT NULL REFERENCES puzzle_groups (id),
  PRIMARY KEY(id)
);
CREATE INDEX puzzle_blocks_idx ON puzzle_blocks (puzzle_group_id);

-- Likes --
CREATE TABLE puzzle_likes (
  id VARCHAR(26) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  puzzle_id VARCHAR(26) NOT NULL REFERENCES puzzles (id),
  user_id VARCHAR(26) NOT NULL REFERENCES users (id),
  PRIMARY KEY(id)
);
CREATE INDEX puzzle_likes_idx ON puzzle_likes (puzzle_id, user_id, active, updated_at);
CREATE UNIQUE INDEX puzzle_likes_unique_idx ON puzzle_likes (puzzle_id, user_id);

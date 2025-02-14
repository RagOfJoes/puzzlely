-- Games --
CREATE TABLE games (
  id VARCHAR(26) NOT NULL,
	score SMALLINT DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL DEFAULT NULL,
	puzzle_id VARCHAR(26) NOT NULL REFERENCES puzzles (id),
	user_id VARCHAR(26) DEFAULT NULL REFERENCES users (id),
	PRIMARY KEY(id)
);
CREATE UNIQUE INDEX games_unique_idx ON games (puzzle_id, user_id);
CREATE INDEX games_idx ON games (completed_at, puzzle_id, user_id);

-- Game Attempts --
CREATE TABLE game_attempts (
	id VARCHAR(26) NOT NULL,
	attempt_order SMALLINT NOT NULL DEFAULT 0,
	selection_order SMALLINT NOT NULL DEFAULT 0,
	puzzle_block_id VARCHAR(26) NOT NULL REFERENCES puzzle_blocks (id),
	game_id VARCHAR(26) NOT NULL REFERENCES games (id),
	PRIMARY KEY(id)
);
CREATE UNIQUE INDEX game_attempts_unique_idx ON game_attempts (game_id, attempt_order, selection_order, puzzle_block_id);

-- Game Corrects --
CREATE TABLE game_corrects (
	id VARCHAR(26) NOT NULL,
	"order" SMALLINT NOT NULL DEFAULT 0,
	puzzle_group_id VARCHAR(26) NOT NULL REFERENCES puzzle_groups (id),
	game_id VARCHAR(26) NOT NULL REFERENCES games (id),
	PRIMARY KEY(id)
);
CREATE UNIQUE INDEX game_corrects_unique_idx ON game_corrects (puzzle_group_id, game_id);

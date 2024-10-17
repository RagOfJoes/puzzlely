-- Games --
CREATE TABLE `games` (
	`id` VARCHAR(26) NOT NULL,
	PRIMARY KEY(`id`),
	`score` SMALLINT DEFAULT 0,
	`challenge_code` VARCHAR(26) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
	`game_id` VARCHAR(26) DEFAULT NULL REFERENCES `games` (`id`),
	`puzzle_id` VARCHAR(26) NOT NULL REFERENCES `puzzles` (`id`),
	`user_id` VARCHAR(26) DEFAULT NULL REFERENCES `users` (`id`)
);
-- Games Unique Index --
ALTER TABLE `games`
ADD UNIQUE INDEX `games_unique_idx` (`challenge_code`);
-- Games Index --
ALTER TABLE `games`
ADD INDEX `games_idx` (`user_id`, `completed_at`, `puzzle_id`);
-- Game Attempts --
CREATE TABLE `game_attempts` (
	`id` VARCHAR(26) NOT NULL,
	PRIMARY KEY(`id`),
	`attempt_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
	`selection_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
	`puzzle_block_id` VARCHAR(26) NOT NULL REFERENCES `puzzle_blocks` (`id`),
	`game_id` VARCHAR(26) NOT NULL REFERENCES `games` (`id`)
);
-- Game Attempts Unique Index --
ALTER TABLE `game_attempts`
ADD UNIQUE INDEX `game_attempts_unique_idx` (`game_id`, `attempt_order`, `selection_order`, `puzzle_block_id`);
-- Game Corrects --
CREATE TABLE `game_corrects` (
	`id` VARCHAR(26) NOT NULL,
	PRIMARY KEY(`id`),
	`order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
	`puzzle_group_id` VARCHAR(26) NOT NULL REFERENCES `puzzle_groups` (`id`),
	`game_id` VARCHAR(26) NOT NULL REFERENCES `games` (`id`)
);
-- Game Corrects Unique Index --
ALTER TABLE `game_corrects`
ADD UNIQUE INDEX `game_corrects_unique_idx` (`puzzle_group_id`, `game_id`);

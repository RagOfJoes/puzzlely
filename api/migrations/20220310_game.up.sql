-- Games --
CREATE TABLE `games` (
	`id` VARCHAR(36) NOT NULL,
	PRIMARY KEY(`id`),
	`score` SMALLINT DEFAULT 0,
	`challenge_code` VARCHAR(24) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`started_at` TIMESTAMP DEFAULT NULL,
	`guessed_at` TIMESTAMP DEFAULT NULL,
	`completed_at` TIMESTAMP DEFAULT NULL,
	`challenged_by` VARCHAR(36) DEFAULT NULL REFERENCES `games` (`id`),
	`puzzle_id` VARCHAR(36) NOT NULL REFERENCES `puzzles` (`id`),
	`user_id` VARCHAR(36) DEFAULT NULL REFERENCES `users` (`id`)
);
-- Games Unique Index --
ALTER TABLE `games`
ADD UNIQUE INDEX `games_unique_idx` (`challenge_code`);
-- Games Index --
ALTER TABLE `games`
ADD INDEX `games_idx` (`user_id`, `completed_at`, `puzzle_id`);
-- Game Configs --
CREATE TABLE `game_configs` (
	`id` VARCHAR(36) NOT NULL,
	PRIMARY KEY(`id`),
	`max_attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
	`time_allowed` INT UNSIGNED NOT NULL DEFAULT 0,
	`game_id` VARCHAR(36) NOT NULL REFERENCES `games` (`id`)
);
-- Game Configs Unique Index --
ALTER TABLE `game_configs`
ADD UNIQUE INDEX `game_configs_unique_idx` (`game_id`);
-- Game Attempts --
CREATE TABLE `game_attempts` (
	`id` VARCHAR(36) NOT NULL,
	PRIMARY KEY(`id`),
	`order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
	`puzzle_block_id` VARCHAR(36) NOT NULL REFERENCES `puzzle_blocks` (`id`),
	`game_id` VARCHAR(36) NOT NULL REFERENCES `games` (`id`)
);
-- Game Attempts Unique Index --
ALTER TABLE `game_attempts`
ADD UNIQUE INDEX `game_attempts_unique_idx` (`game_id`, `order`, `puzzle_block_id`);
-- Game Corrects --
CREATE TABLE `game_corrects` (
	`id` VARCHAR(36) NOT NULL,
	PRIMARY KEY(`id`),
	`puzzle_group_id` VARCHAR(36) NOT NULL REFERENCES `puzzle_groups` (`id`),
	`game_id` VARCHAR(36) NOT NULL REFERENCES `games` (`id`)
);
-- Game Corrects Unique Index --
ALTER TABLE `game_corrects`
ADD UNIQUE INDEX `game_corrects_unique_idx` (`puzzle_group_id`, `game_id`);
-- Game Results --
CREATE TABLE `game_results` (
	`id` VARCHAR(36) NOT NULL,
	PRIMARY KEY(`id`),
	`guess` VARCHAR(24),
	`correct` BOOLEAN DEFAULT FALSE,
	`puzzle_group_id` VARCHAR(36) NOT NULL REFERENCES `puzzle_groups` (`id`),
	`game_id` VARCHAR(36) NOT NULL REFERENCES `games` (`id`)
);
-- Game Results Index --
ALTER TABLE `game_results`
ADD UNIQUE INDEX `game_results_unique_index` (`puzzle_group_id`, `game_id`);
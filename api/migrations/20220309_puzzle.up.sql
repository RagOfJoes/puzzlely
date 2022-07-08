-- Puzzles --
CREATE TABLE `puzzles` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `name` VARCHAR(64) NOT NULL,
    `description` TEXT,
    `difficulty` VARCHAR(12) NOT NULL,
    `max_attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `time_allowed` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT NULL,
    `deleted_at` TIMESTAMP DEFAULT NULL,
    `user_id` VARCHAR(36) NOT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `puzzles`
ADD INDEX `puzzles_idx` (
        `user_id`,
        `deleted_at`,
        `created_at`,
        `updated_at`
    );
ALTER TABLE `puzzles`
ADD FULLTEXT `puzzles_fulltext_idx` (`name`, `description`);
-- Groups --
CREATE TABLE `puzzle_groups` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `description` TEXT,
    `puzzle_id` VARCHAR(36) NOT NULL REFERENCES `puzzles` (`id`)
);
ALTER TABLE `puzzle_groups`
ADD INDEX `puzzle_groups_idx` (`puzzle_id`);
-- Group Answers
CREATE TABLE `puzzle_group_answers` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `answer` VARCHAR(24) NOT NULL,
    `puzzle_group_id` VARCHAR(36) NOT NULL REFERENCES `puzzle_groups` (`id`)
);
ALTER TABLE `puzzle_group_answers`
ADD INDEX `puzzle_group_answers_idx` (`puzzle_group_id`);
-- Blocks --
CREATE TABLE `puzzle_blocks`(
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `value` VARCHAR(48) NOT NULL,
    `puzzle_group_id` VARCHAR(36) NOT NULL REFERENCES `puzzle_groups` (`id`)
);
ALTER TABLE `puzzle_blocks`
ADD INDEX `puzzle_blocks_idx` (`puzzle_group_id`);
-- Likes --
CREATE TABLE `puzzle_likes` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT NULL,
    `puzzle_id` VARCHAR(36) NOT NULL REFERENCES `puzzles` (`id`),
    `user_id` VARCHAR(36) NOT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `puzzle_likes`
ADD INDEX `puzzle_likes_idx` (`puzzle_id`, `user_id`, `active`, `updated_at`);
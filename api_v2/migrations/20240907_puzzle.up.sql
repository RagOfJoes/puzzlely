-- Puzzles --
CREATE TABLE `puzzles` (
    `id` VARCHAR(26) NOT NULL,
    PRIMARY KEY(`id`),
    `difficulty` VARCHAR(12) NOT NULL,
    `max_attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    `user_id` VARCHAR(26) NOT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `puzzles`
ADD INDEX `puzzles_idx` (
        `user_id`,
        `deleted_at`,
        `created_at`,
        `updated_at`
    );
-- Groups --
CREATE TABLE `puzzle_groups` (
    `id` VARCHAR(26) NOT NULL,
    PRIMARY KEY(`id`),
    `description` TEXT,
    `puzzle_id` VARCHAR(26) NOT NULL REFERENCES `puzzles` (`id`)
);
ALTER TABLE `puzzle_groups`
ADD INDEX `puzzle_groups_idx` (`puzzle_id`);
-- Blocks --
CREATE TABLE `puzzle_blocks`(
    `id` VARCHAR(26) NOT NULL,
    PRIMARY KEY(`id`),
    `value` VARCHAR(48) NOT NULL,
    `puzzle_group_id` VARCHAR(26) NOT NULL REFERENCES `puzzle_groups` (`id`)
);
ALTER TABLE `puzzle_blocks`
ADD INDEX `puzzle_blocks_idx` (`puzzle_group_id`);
-- Likes --
CREATE TABLE `puzzle_likes` (
    `id` VARCHAR(26) NOT NULL,
    PRIMARY KEY(`id`),
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `puzzle_id` VARCHAR(26) NOT NULL REFERENCES `puzzles` (`id`),
    `user_id` VARCHAR(26) NOT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `puzzle_likes`
ADD INDEX `puzzle_likes_idx` (`puzzle_id`, `user_id`, `active`, `updated_at`);

-- User --
CREATE TABLE `users` (
    `id` VARCHAR(26) NOT NULL,
    PRIMARY KEY(`id`),
    `state` VARCHAR(8) NOT NULL,
    `username` VARCHAR(24) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL
);
ALTER TABLE `users`
ADD UNIQUE INDEX `users_unique_idx` (`username`);
ALTER TABLE `users`
ADD INDEX `users_idx` (`deleted_at`, `created_at`, `updated_at`);
-- Connection --
CREATE TABLE `connections` (
    `id` VARCHAR(26) NOT NULL,
    PRIMARY KEY(`id`),
    `provider` VARCHAR(24) NOT NULL,
    `sub` VARCHAR(128) NOT NULL,
    `user_id` VARCHAR(26) NOT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `connections`
ADD UNIQUE INDEX `connections_unique_idx` (`sub`);
ALTER TABLE `connections`
ADD INDEX `connections_idx` (`provider`, `user_id`);

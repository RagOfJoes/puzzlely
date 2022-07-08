-- User --
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `state` VARCHAR(8) NOT NULL,
    `username` VARCHAR(24) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT NULL,
    `deleted_at` TIMESTAMP DEFAULT NULL,
);
ALTER TABLE `users`
ADD UNIQUE INDEX `users_unique_idx` (`username`);
ALTER TABLE `users`
ADD INDEX `users_idx` (`deleted_at`, `created_at`, `updated_at`);
-- Connection --
CREATE TABLE `connections` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `provider` VARCHAR(24) NOT NULL,
    `sub` VARCHAR(128) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `connections`
ADD UNIQUE INDEX `connections_unique_idx` (`sub`);
ALTER TABLE `connections`
ADD INDEX `connections_idx` (`provider`, `user_id`);
-- Session --
CREATE TABLE `sessions` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY(`id`),
    `state` VARCHAR(15) NOT NULL DEFAULT ('Unauthenticated'),
    `token` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `expires_at` TIMESTAMP DEFAULT NULL,
    `authenticated_at` TIMESTAMP DEFAULT NULL,
    `user_id` VARCHAR(36) DEFAULT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `sessions`
ADD UNIQUE INDEX `sessions_unique_idx` (`token`);
ALTER TABLE `sessions`
ADD INDEX `sessions_idx` (`user_id`, `state`);
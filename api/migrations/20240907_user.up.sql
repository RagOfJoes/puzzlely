-- Users --
CREATE TABLE users (
  id VARCHAR(26) NOT NULL,
  state VARCHAR(8) NOT NULL,
  username VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  PRIMARY KEY(id)
);
CREATE UNIQUE INDEX users_unique_idx ON users (username);
CREATE INDEX users_idx ON users (deleted_at, created_at, updated_at);

-- Connections --
CREATE TABLE connections (
  id VARCHAR(26) NOT NULL,
  provider VARCHAR(24) NOT NULL,
  sub VARCHAR(128) NOT NULL,
  user_id VARCHAR(26) NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE UNIQUE INDEX connections_unique_idx ON connections (sub);
CREATE INDEX connections_idx ON connections (provider, user_id);

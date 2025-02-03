-- Session --
CREATE TABLE sessions (
  id VARCHAR(26) NOT NULL,
  state VARCHAR(15) NOT NULL DEFAULT 'Unauthenticated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  authenticated_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  user_id VARCHAR(26) DEFAULT NULL REFERENCES users (id),
  PRIMARY KEY(id)
);
CREATE INDEX sessions_idx ON sessions (user_id, state);

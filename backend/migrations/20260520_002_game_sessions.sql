CREATE TABLE game_sessions (
    session_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID REFERENCES users(user_id),
    article_id     UUID NOT NULL REFERENCES articles(article_id),
    revealed_count INTEGER NOT NULL DEFAULT 1,
    guesses_used   INTEGER NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_game_sessions_user_article
    ON game_sessions(user_id, article_id);

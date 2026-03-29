CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS games;

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE articles (
    article_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE guess_counts (
    guess_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    num_guesses INTEGER NOT NULL
);

CREATE INDEX idx_guess_counts_user_id ON guess_counts(user_id);

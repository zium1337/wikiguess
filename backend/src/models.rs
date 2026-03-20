use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct User {
    pub user_id: Uuid,
    pub email: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct Article {
    pub article_id: Uuid,
    pub url: String,
    pub title: String,
    pub description: String,
    pub used_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct GuessCount {
    pub guess_id: Uuid,
    pub user_id: Uuid,
    pub date: DateTime<Utc>,
    pub num_guesses: i32,
}

#[derive(Deserialize)]
pub struct CreateUser {
    pub email: String,
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct GuessRequest {
    pub guess: String,
}

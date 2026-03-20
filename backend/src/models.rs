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
pub struct RegisterRequest {
    pub email: String,
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct ChangePasswordRequest {
    pub old_password: String,
    pub new_password: String,
}

#[derive(Deserialize)]
pub struct UserStatsRequest {
    pub num_guesses: i32,
}

#[derive(Deserialize)]
pub struct UpdateArticleRequest {
    pub url: Option<String>,
    pub title: Option<String>,
    pub description: Option<String>,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}

#[derive(Serialize)]
pub struct ArticleStatsResponse {
    pub total_guesses: i64,
    pub average_guesses: f64,
    pub player_count: i64,
}

#[derive(Serialize)]
pub struct ArticleHistoryEntry {
    pub article: Article,
    pub stats: ArticleStatsResponse,
}

mod auth;
mod models;
mod routes;

use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
pub struct AppState {
    pub pool: sqlx::PgPool,
    pub jwt_secret: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret-change-me".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let state = AppState { pool, jwt_secret };

    let app = Router::new()
        // Auth
        .route("/auth/register", post(routes::register))
        .route("/auth/login", post(routes::login))
        // Article
        .route("/article/today", get(routes::get_today_article))
        .route("/article/today", patch(routes::update_today_article))
        .route("/article/stats", get(routes::get_article_stats))
        .route("/article/history", post(routes::create_article_history))
        // User stats
        .route("/user/stats", post(routes::post_user_stats))
        // User management
        .route("/user/change-password/{id}", patch(routes::change_password))
        .route("/user/{id}", delete(routes::delete_user))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Server running on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}

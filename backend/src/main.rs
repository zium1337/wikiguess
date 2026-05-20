mod auth;
mod models;
mod routes;

use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::models::*;

#[derive(Clone)]
pub struct AppState {
    pub pool: sqlx::PgPool,
    pub jwt_secret: String,
}

#[derive(OpenApi)]
#[openapi(
    paths(
        routes::register,
        routes::login,
        routes::change_password,
        routes::delete_user,
        routes::get_today_article,
        routes::update_today_article,
        routes::get_article_stats,
        routes::create_article_history,
        routes::post_user_stats,
    ),
    components(schemas(
        User, Article, GuessCount,
        RegisterRequest, LoginRequest, ChangePasswordRequest,
        UserStatsRequest, UpdateArticleRequest,
        AuthResponse, ArticleStatsResponse, ArticleHistoryEntry,
    )),
    security(("bearer_auth" = [])),
    modifiers(&SecurityAddon),
    tags(
        (name = "Auth", description = "Registration and login"),
        (name = "Article", description = "Daily article and stats"),
        (name = "User", description = "User management and stats"),
    )
)]
struct ApiDoc;

struct SecurityAddon;

impl utoipa::Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                utoipa::openapi::security::SecurityScheme::Http(
                    utoipa::openapi::security::Http::new(
                        utoipa::openapi::security::HttpAuthScheme::Bearer,
                    ),
                ),
            );
        }
    }
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
        // Swagger UI
        .merge(SwaggerUi::new("/docs").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Server running on http://localhost:3000");
    println!("Swagger UI: http://localhost:3000/docs/");
    axum::serve(listener, app).await.unwrap();
}

use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use crate::auth::{create_token, AuthUser};
use crate::models::*;
use crate::AppState;

// --- Auth and user related ---

#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "User registered", body = AuthResponse),
        (status = 400, description = "Invalid input")
    ),
    tag = "Auth"
)]
pub async fn register(
    State(state): State<AppState>,
    Json(input): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), (StatusCode, String)> {
    let hashed = bcrypt::hash(&input.password, bcrypt::DEFAULT_COST)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *",
    )
    .bind(&input.email)
    .bind(&input.username)
    .bind(&hashed)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    let token = create_token(user.user_id, &state.jwt_secret)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(AuthResponse { token, user })))
}

#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = AuthResponse),
        (status = 401, description = "Invalid credentials")
    ),
    tag = "Auth"
)]
pub async fn login(
    State(state): State<AppState>,
    Json(input): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&input.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))?;

    let valid = bcrypt::verify(&input.password, &user.password)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if !valid {
        return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    let token = create_token(user.user_id, &state.jwt_secret)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(AuthResponse { token, user }))
}

#[utoipa::path(
    patch,
    path = "/user/change-password/{id}",
    request_body = ChangePasswordRequest,
    params(("id" = Uuid, Path, description = "User ID")),
    responses(
        (status = 204, description = "Password changed"),
        (status = 401, description = "Wrong old password"),
        (status = 403, description = "Forbidden")
    ),
    security(("bearer_auth" = [])),
    tag = "User"
)]
pub async fn change_password(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(user_id): Path<Uuid>,
    Json(input): Json<ChangePasswordRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    if auth.user_id != user_id {
        return Err((StatusCode::FORBIDDEN, "Cannot change another user's password".to_string()));
    }

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "User not found".to_string()))?;

    let valid = bcrypt::verify(&input.old_password, &user.password)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if !valid {
        return Err((StatusCode::UNAUTHORIZED, "Wrong old password".to_string()));
    }

    let hashed = bcrypt::hash(&input.new_password, bcrypt::DEFAULT_COST)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    sqlx::query("UPDATE users SET password = $1 WHERE user_id = $2")
        .bind(&hashed)
        .bind(user_id)
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}

#[utoipa::path(
    delete,
    path = "/user/{id}",
    params(("id" = Uuid, Path, description = "User ID")),
    responses(
        (status = 204, description = "User deleted"),
        (status = 403, description = "Forbidden")
    ),
    security(("bearer_auth" = [])),
    tag = "User"
)]
pub async fn delete_user(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(user_id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    if auth.user_id != user_id {
        return Err((StatusCode::FORBIDDEN, "Cannot delete another user".to_string()));
    }

    sqlx::query("DELETE FROM guess_counts WHERE user_id = $1")
        .bind(user_id)
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    sqlx::query("DELETE FROM users WHERE user_id = $1")
        .bind(user_id)
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}

// --- Article ---

#[utoipa::path(
    get,
    path = "/article/today",
    responses(
        (status = 200, description = "Today's article", body = Article),
        (status = 404, description = "No article for today")
    ),
    tag = "Article"
)]
pub async fn get_today_article(
    State(state): State<AppState>,
) -> Result<Json<Article>, (StatusCode, String)> {
    let article = sqlx::query_as::<_, Article>(
        "SELECT * FROM articles WHERE DATE(used_at) = CURRENT_DATE ORDER BY used_at DESC LIMIT 1",
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "No article for today".to_string()))?;

    Ok(Json(article))
}

#[utoipa::path(
    patch,
    path = "/article/today",
    request_body = UpdateArticleRequest,
    responses(
        (status = 200, description = "Article updated", body = Article),
        (status = 404, description = "No article for today")
    ),
    tag = "Article"
)]
pub async fn update_today_article(
    State(state): State<AppState>,
    Json(input): Json<UpdateArticleRequest>,
) -> Result<Json<Article>, (StatusCode, String)> {
    let article = sqlx::query_as::<_, Article>(
        "UPDATE articles SET \
         url = COALESCE($1, url), \
         title = COALESCE($2, title), \
         description = COALESCE($3, description) \
         WHERE DATE(used_at) = CURRENT_DATE \
         RETURNING *",
    )
    .bind(&input.url)
    .bind(&input.title)
    .bind(&input.description)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "No article for today".to_string()))?;

    Ok(Json(article))
}

#[utoipa::path(
    get,
    path = "/article/stats",
    responses(
        (status = 200, description = "Global stats for today", body = ArticleStatsResponse)
    ),
    tag = "Article"
)]
pub async fn get_article_stats(
    State(state): State<AppState>,
) -> Result<Json<ArticleStatsResponse>, (StatusCode, String)> {
    let stats = sqlx::query_as::<_, (i64, f64, i64)>(
        "SELECT \
         COALESCE(SUM(num_guesses), 0), \
         COALESCE(AVG(num_guesses::float), 0), \
         COUNT(DISTINCT user_id) \
         FROM guess_counts \
         WHERE DATE(date) = CURRENT_DATE",
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(ArticleStatsResponse {
        total_guesses: stats.0,
        average_guesses: stats.1,
        player_count: stats.2,
    }))
}

#[utoipa::path(
    post,
    path = "/article/history",
    responses(
        (status = 200, description = "Article history with stats", body = Vec<ArticleHistoryEntry>)
    ),
    tag = "Article"
)]
pub async fn create_article_history(
    State(state): State<AppState>,
) -> Result<Json<Vec<ArticleHistoryEntry>>, (StatusCode, String)> {
    let articles = sqlx::query_as::<_, Article>(
        "SELECT * FROM articles WHERE DATE(used_at) < CURRENT_DATE ORDER BY used_at DESC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut history = Vec::new();
    for article in articles {
        let stats = sqlx::query_as::<_, (i64, f64, i64)>(
            "SELECT \
             COALESCE(SUM(num_guesses), 0), \
             COALESCE(AVG(num_guesses::float), 0), \
             COUNT(DISTINCT user_id) \
             FROM guess_counts \
             WHERE DATE(date) = DATE($1)",
        )
        .bind(article.used_at)
        .fetch_one(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        history.push(ArticleHistoryEntry {
            article,
            stats: ArticleStatsResponse {
                total_guesses: stats.0,
                average_guesses: stats.1,
                player_count: stats.2,
            },
        });
    }

    Ok(Json(history))
}

// --- User stats ---

#[utoipa::path(
    post,
    path = "/user/stats",
    request_body = UserStatsRequest,
    responses(
        (status = 201, description = "Stats saved", body = GuessCount),
        (status = 400, description = "Invalid input")
    ),
    security(("bearer_auth" = [])),
    tag = "User"
)]
pub async fn post_user_stats(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(input): Json<UserStatsRequest>,
) -> Result<(StatusCode, Json<GuessCount>), (StatusCode, String)> {
    let guess = sqlx::query_as::<_, GuessCount>(
        "INSERT INTO guess_counts (user_id, num_guesses) VALUES ($1, $2) RETURNING *",
    )
    .bind(auth.user_id)
    .bind(input.num_guesses)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(guess)))
}

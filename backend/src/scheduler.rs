use chrono::{DateTime, Utc};
use sqlx::PgPool;
use std::time::Duration;

use crate::wikipedia::{self, NewArticle};

/// Returns the time remaining until the next UTC midnight.
fn duration_until_next_utc_midnight(now: DateTime<Utc>) -> Duration {
    let tomorrow = (now + chrono::Duration::days(1)).date_naive();
    let next_midnight = tomorrow
        .and_hms_opt(0, 0, 0)
        .expect("00:00:00 is a valid time")
        .and_utc();
    (next_midnight - now)
        .to_std()
        .unwrap_or(Duration::from_secs(60))
}

/// Checks whether the database already has an article for today's date.
async fn article_exists_today(pool: &PgPool) -> Result<bool, sqlx::Error> {
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM articles WHERE DATE(used_at) = CURRENT_DATE)",
    )
    .fetch_one(pool)
    .await?;
    Ok(exists)
}

/// Stores a new article in the database.
async fn insert_article(pool: &PgPool, article: &NewArticle) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO articles (url, title, description) VALUES ($1, $2, $3)")
        .bind(&article.url)
        .bind(&article.title)
        .bind(&article.description)
        .execute(pool)
        .await?;
    Ok(())
}

/// Ensures an article exists for today.
pub async fn ensure_today_article(pool: &PgPool, client: &reqwest::Client) {
    match article_exists_today(pool).await {
        Ok(true) => return,
        Ok(false) => {}
        Err(e) => {
            eprintln!("[scheduler] database check failed: {e}");
            return;
        }
    }

    let article = match wikipedia::fetch_random_valid_article(client).await {
        Ok(a) => a,
        Err(e) => {
            eprintln!("[scheduler] failed to fetch article: {e}");
            return;
        }
    };

    match insert_article(pool, &article).await {
        Ok(()) => println!("[scheduler] saved today's article: {}", article.title),
        Err(e) => eprintln!("[scheduler] failed to save article: {e}"),
    }
}

/// Spawns the background task: ensure on startup, then daily at 00:00 UTC.
pub fn spawn_daily_article_task(pool: PgPool, client: reqwest::Client) {
    tokio::spawn(async move {
        loop {
            ensure_today_article(&pool, &client).await;
            let wait = duration_until_next_utc_midnight(Utc::now());
            tokio::time::sleep(wait).await;
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn noon_gives_twelve_hours() {
        let now = Utc.with_ymd_and_hms(2026, 5, 18, 12, 0, 0).unwrap();
        assert_eq!(duration_until_next_utc_midnight(now).as_secs(), 12 * 3600);
    }

    #[test]
    fn one_second_before_midnight_gives_one_second() {
        let now = Utc.with_ymd_and_hms(2026, 5, 18, 23, 59, 59).unwrap();
        assert_eq!(duration_until_next_utc_midnight(now).as_secs(), 1);
    }
}

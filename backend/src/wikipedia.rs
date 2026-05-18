use serde::Deserialize;

const WIKI_SUMMARY_URL: &str = "https://en.wikipedia.org/api/rest_v1/page/random/summary";
const MIN_SENTENCES: usize = 5;
const MAX_FETCH_ATTEMPTS: usize = 30;
const USER_AGENT: &str =
    "Wikiguess/0.1 (https://github.com/zium1337/wikiguess; educational project)";

/// Counts sentences in the text: `.`, `!`, `?` characters followed by
/// a space, a newline, or the end of the text.
pub fn count_sentences(text: &str) -> usize {
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return 0;
    }
    let bytes = trimmed.as_bytes();
    let mut count = 0;
    for (i, &b) in bytes.iter().enumerate() {
        if b == b'.' || b == b'!' || b == b'?' {
            match bytes.get(i + 1) {
                None => count += 1,
                Some(&next) if next == b' ' || next == b'\n' => count += 1,
                _ => {}
            }
        }
    }
    count
}

/// An article ready to be stored in the database.
#[derive(Debug, Clone, PartialEq)]
pub struct NewArticle {
    pub url: String,
    pub title: String,
    pub description: String,
}

/// Wikipedia Service errors.
#[derive(Debug)]
pub enum WikiError {
    Network(String),
    Parse(String),
    NoValidArticle,
}

impl std::fmt::Display for WikiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            WikiError::Network(msg) => write!(f, "network error: {msg}"),
            WikiError::Parse(msg) => write!(f, "parse error: {msg}"),
            WikiError::NoValidArticle => {
                write!(f, "no sufficiently long article found")
            }
        }
    }
}

impl std::error::Error for WikiError {}

#[derive(Deserialize)]
struct WikiSummary {
    title: String,
    extract: String,
    content_urls: ContentUrls,
}

#[derive(Deserialize)]
struct ContentUrls {
    desktop: ContentUrl,
}

#[derive(Deserialize)]
struct ContentUrl {
    page: String,
}

/// Parses JSON from the REST Summary API into a `NewArticle`.
pub fn parse_summary(json: &str) -> Result<NewArticle, WikiError> {
    let summary: WikiSummary =
        serde_json::from_str(json).map_err(|e| WikiError::Parse(e.to_string()))?;
    Ok(NewArticle {
        url: summary.content_urls.desktop.page,
        title: summary.title,
        description: summary.extract,
    })
}

/// Draws random Wikipedia articles until one is long enough (>= MIN_SENTENCES
/// sentences), or gives up after MAX_FETCH_ATTEMPTS attempts.
pub async fn fetch_random_valid_article(client: &reqwest::Client) -> Result<NewArticle, WikiError> {
    for _ in 0..MAX_FETCH_ATTEMPTS {
        let body = client
            .get(WIKI_SUMMARY_URL)
            .header("User-Agent", USER_AGENT)
            .send()
            .await
            .map_err(|e| WikiError::Network(e.to_string()))?
            .text()
            .await
            .map_err(|e| WikiError::Network(e.to_string()))?;

        let article = match parse_summary(&body) {
            Ok(a) => a,
            Err(e) => {
                eprintln!("[wikipedia] failed to parse response: {e}");
                continue;
            }
        };

        if count_sentences(&article.description) >= MIN_SENTENCES {
            return Ok(article);
        }
    }
    Err(WikiError::NoValidArticle)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_text_has_no_sentences() {
        assert_eq!(count_sentences(""), 0);
        assert_eq!(count_sentences("   "), 0);
    }

    #[test]
    fn single_sentence_counts_one() {
        assert_eq!(count_sentences("Hello world."), 1);
    }

    #[test]
    fn two_sentence_count_two() {
        // U know, selfish - sell fish :D
        assert_eq!(count_sentences("Selfish. How much?"), 2);
    }

    #[test]
    fn five_sentences_count_five() {
        assert_eq!(count_sentences("One. Two. Three. Four. Five."), 5);
    }

    #[test]
    fn question_and_exclamation_count() {
        assert_eq!(count_sentences("Really? Yes! Okay."), 3);
    }

    #[test]
    fn ellipsis_counts_as_part_of_sentence() {
        assert_eq!(count_sentences("Wait... what happened."), 2);
    }

    // Shrek tests (where the project came from)
    #[test]
    fn parses_valid_summary_json() {
        let json = r#"{
            "title": "Shrek",
            "extract": "Shrek is a 2001 American animated film. It is loosely based on a picture book.",
            "content_urls": {
                "desktop": { "page": "https://en.wikipedia.org/wiki/Shrek" },
                "mobile": { "page": "https://en.m.wikipedia.org/wiki/Shrek" }
            }
        }"#;
        let article = parse_summary(json).expect("should parse successfully");
        assert_eq!(article.title, "Shrek");
        assert_eq!(article.url, "https://en.wikipedia.org/wiki/Shrek");
        assert!(article.description.contains("animated"));
    }

    #[test]
    fn fails_when_extract_missing() {
        let json = r#"{
            "title": "X",
            "content_urls": { "desktop": { "page": "https://x" } }
        }"#;
        assert!(matches!(parse_summary(json), Err(WikiError::Parse(_))));
    }

    #[tokio::test]
    #[ignore = "requires network — run: cargo test -- --ignored"]
    async fn fetches_real_article_from_wikipedia() {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(10))
            .build()
            .unwrap();
        let article = fetch_random_valid_article(&client).await.unwrap();
        assert!(!article.title.is_empty());
        assert!(article.url.starts_with("https://"));
        assert!(count_sentences(&article.description) >= MIN_SENTENCES);
    }
}

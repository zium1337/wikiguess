use crate::models::{Article, GameStateDto, GameStatus, SentenceDto};

/// Maximum number of guesses before the game is marked LOST.
pub const MAX_GUESSES: i32 = 4;
/// Number of sentences revealed on session creation.
pub const INITIAL_REVEALED: i32 = 1;
/// Token that replaces censored title words. Matches frontend `Article.tsx`.
pub const CENSOR_MARKER: &str = "_censoredWord_";

/// Splits text into sentences. Boundary: `.`, `!`, `?` followed by
/// whitespace, newline, or end of text. Keeps terminating punctuation
/// in the sentence.
pub fn split_sentences(text: &str) -> Vec<String> {
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return Vec::new();
    }
    let bytes = trimmed.as_bytes();
    let mut sentences = Vec::new();
    let mut start = 0usize;
    let mut i = 0usize;
    while i < bytes.len() {
        let b = bytes[i];
        if b == b'.' || b == b'!' || b == b'?' {
            let is_boundary = match bytes.get(i + 1) {
                None => true,
                Some(&n) if n == b' ' || n == b'\n' => true,
                _ => false,
            };
            if is_boundary {
                let piece = trimmed[start..=i].trim();
                if !piece.is_empty() {
                    sentences.push(piece.to_string());
                }
                start = i + 1;
            }
        }
        i += 1;
    }
    if start < bytes.len() {
        let remainder = trimmed[start..].trim();
        if !remainder.is_empty() {
            sentences.push(remainder.to_string());
        }
    }
    sentences
}

/// Removes trailing ` (...)` from titles.
pub fn strip_disambiguation(title: &str) -> &str {
    let trimmed = title.trim_end();
    if trimmed.ends_with(')') {
        if let Some(open) = trimmed.rfind(" (") {
            return trimmed[..open].trim_end();
        }
    }
    trimmed
}

pub fn normalize(s: &str) -> String {
    s.trim().to_lowercase()
}

/// Compares a guess to an article title with normalization and disambiguation stripping.
pub fn is_correct_guess(guess: &str, title: &str) -> bool {
    normalize(guess) == normalize(strip_disambiguation(title))
}

/// Maps the DB text status to the `GameStatus` enum.
pub fn parse_status(s: &str) -> GameStatus {
    match s {
        "WON" => GameStatus::Won,
        "LOST" => GameStatus::Lost,
        "IN_PROGRESS" => GameStatus::InProgress,
        other => {
            eprintln!("[game] unknown session status '{other}', defaulting to IN_PROGRESS");
            GameStatus::InProgress
        }
    }
}

/// Maps the `GameStatus` enum back to the DB text representation.
pub fn status_to_str(s: GameStatus) -> &'static str {
    match s {
        GameStatus::InProgress => "IN_PROGRESS",
        GameStatus::Won => "WON",
        GameStatus::Lost => "LOST",
    }
}

/// Replaces each title word (whole word, case-insensitive) with `CENSOR_MARKER`.
/// Disambiguation suffix `(...)` is stripped from the title before tokenizing.
pub fn censor_title(sentence: &str, title: &str) -> String {
    let cleaned = strip_disambiguation(title);
    let title_words: Vec<String> = cleaned
        .split_whitespace()
        .map(|w| w.to_lowercase())
        .collect();
    if title_words.is_empty() {
        return sentence.to_string();
    }

    let mut result = String::with_capacity(sentence.len());
    let mut current = String::new();
    for c in sentence.chars() {
        if c.is_alphanumeric() {
            current.push(c);
        } else {
            flush_word(&current, &mut result, &title_words);
            current.clear();
            result.push(c);
        }
    }
    flush_word(&current, &mut result, &title_words);
    result
}

fn flush_word(word: &str, out: &mut String, title_words: &[String]) {
    if word.is_empty() {
        return;
    }
    let lower = word.to_lowercase();
    if title_words.iter().any(|tw| tw == &lower) {
        out.push_str(CENSOR_MARKER);
    } else {
        out.push_str(word);
    }
}

/// Applies a single guess and returns (new_revealed, new_guesses_used, new_status).
/// Reveals all sentences when the game ends (WON or LOST).
pub fn apply_guess(
    guess: &str,
    title: &str,
    revealed: i32,
    guesses_used: i32,
    total_sentences: i32,
) -> (i32, i32, GameStatus) {
    let new_guesses = guesses_used + 1;
    if is_correct_guess(guess, title) {
        return (total_sentences, new_guesses, GameStatus::Won);
    }
    if new_guesses >= MAX_GUESSES {
        return (total_sentences, new_guesses, GameStatus::Lost);
    }
    let new_revealed = (revealed + 1).min(total_sentences);
    (new_revealed, new_guesses, GameStatus::InProgress)
}

/// Builds the response DTO from session state + the article.
pub fn build_game_state_dto(
    article: &Article,
    revealed_count: i32,
    guesses_used: i32,
    status: GameStatus,
) -> GameStateDto {
    let sentences_raw = split_sentences(&article.description);
    let total = sentences_raw.len() as i32;
    let reveal_n = revealed_count.max(0).min(total) as usize;
    let revealed: Vec<SentenceDto> = sentences_raw
        .iter()
        .take(reveal_n)
        .enumerate()
        .map(|(idx, s)| SentenceDto {
            index: idx as i32,
            text: censor_title(s, &article.title),
        })
        .collect();
    let show_meta = !matches!(status, GameStatus::InProgress);
    GameStateDto {
        total_sentences_num: total,
        guesses_left_num: (MAX_GUESSES - guesses_used).max(0),
        revealed_sentences: revealed,
        game_status: status,
        article_title: if show_meta {
            Some(article.title.clone())
        } else {
            None
        },
        article_url: if show_meta {
            Some(article.url.clone())
        } else {
            None
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn split_empty_returns_empty() {
        assert!(split_sentences("").is_empty());
        assert!(split_sentences("   ").is_empty());
    }

    #[test]
    fn split_single_sentence() {
        assert_eq!(split_sentences("Hello world."), vec!["Hello world."]);
    }

    #[test]
    fn split_two_sentences() {
        assert_eq!(split_sentences("Selfish. How much?"), vec!["Selfish.", "How much?"]);
    }

    #[test]
    fn split_three_sentences() {
        assert_eq!(
            split_sentences("One. Two. Three."),
            vec!["One.", "Two.", "Three."]
        );
    }

    #[test]
    fn split_with_question_and_exclamation() {
        assert_eq!(
            split_sentences("Really? Yes! Okay."),
            vec!["Really?", "Yes!", "Okay."]
        );
    }

    #[test]
    fn split_trailing_without_terminator() {
        assert_eq!(split_sentences("First. Second"), vec!["First.", "Second"]);
    }

    #[test]
    fn strip_disambig_removes_parens() {
        assert_eq!(strip_disambiguation("Mercury (planet)"), "Mercury");
    }

    #[test]
    fn strip_disambig_keeps_plain_title() {
        assert_eq!(strip_disambiguation("Shrek"), "Shrek");
    }

    #[test]
    fn strip_disambig_keeps_internal_parens() {
        assert_eq!(strip_disambiguation("A (B) C"), "A (B) C");
    }

    #[test]
    fn correct_guess_case_insensitive() {
        assert!(is_correct_guess("shrek", "Shrek"));
        assert!(is_correct_guess("SHREK", "Shrek"));
    }

    #[test]
    fn correct_guess_strips_disambiguation() {
        assert!(is_correct_guess("mercury", "Mercury (planet)"));
    }

    #[test]
    fn correct_guess_trims_whitespace() {
        assert!(is_correct_guess("  Shrek  ", "Shrek"));
    }

    #[test]
    fn wrong_guess_is_false() {
        assert!(!is_correct_guess("Donkey", "Shrek"));
    }

    #[test]
    fn parse_status_round_trip() {
        assert_eq!(parse_status("WON"), GameStatus::Won);
        assert_eq!(parse_status("LOST"), GameStatus::Lost);
        assert_eq!(parse_status("IN_PROGRESS"), GameStatus::InProgress);
        assert_eq!(parse_status("garbage"), GameStatus::InProgress);
    }

    #[test]
    fn status_to_str_round_trip() {
        assert_eq!(status_to_str(GameStatus::InProgress), "IN_PROGRESS");
        assert_eq!(status_to_str(GameStatus::Won), "WON");
        assert_eq!(status_to_str(GameStatus::Lost), "LOST");
    }

    #[test]
    fn censor_single_word_title() {
        assert_eq!(
            censor_title("Shrek is a film.", "Shrek"),
            "_censoredWord_ is a film."
        );
    }

    #[test]
    fn censor_is_case_insensitive() {
        assert_eq!(
            censor_title("shrek and SHREK.", "Shrek"),
            "_censoredWord_ and _censoredWord_."
        );
    }

    #[test]
    fn censor_only_whole_words() {
        assert_eq!(censor_title("Shrekian beast.", "Shrek"), "Shrekian beast.");
    }

    #[test]
    fn censor_multi_word_title() {
        assert_eq!(
            censor_title(
                "Albert Einstein was great. Einstein wrote.",
                "Albert Einstein"
            ),
            "_censoredWord_ _censoredWord_ was great. _censoredWord_ wrote."
        );
    }

    #[test]
    fn censor_strips_disambiguation_from_title() {
        // "planet" must NOT be censored — only "Mercury" matters.
        assert_eq!(
            censor_title("Mercury is a hot planet.", "Mercury (planet)"),
            "_censoredWord_ is a hot planet."
        );
    }

    #[test]
    fn apply_correct_guess_wins() {
        let (revealed, guesses, status) = apply_guess("Shrek", "Shrek", 1, 0, 4);
        assert_eq!(status, GameStatus::Won);
        assert_eq!(guesses, 1);
        assert_eq!(revealed, 4);
    }

    #[test]
    fn apply_wrong_guess_continues() {
        let (revealed, guesses, status) = apply_guess("Nope", "Shrek", 1, 0, 4);
        assert_eq!(status, GameStatus::InProgress);
        assert_eq!(guesses, 1);
        assert_eq!(revealed, 2);
    }

    #[test]
    fn apply_wrong_guess_at_limit_loses() {
        let (revealed, guesses, status) = apply_guess("Nope", "Shrek", 4, 3, 4);
        assert_eq!(status, GameStatus::Lost);
        assert_eq!(guesses, 4);
        assert_eq!(revealed, 4);
    }

    #[test]
    fn apply_wrong_guess_does_not_reveal_past_total() {
        let (revealed, _, _) = apply_guess("Nope", "Shrek", 4, 0, 4);
        assert_eq!(revealed, 4);
    }

    fn sample_article() -> Article {
        Article {
            article_id: uuid::Uuid::nil(),
            url: "https://en.wikipedia.org/wiki/Shrek".to_string(),
            title: "Shrek".to_string(),
            description: "Shrek is a film. It has an ogre. He is green.".to_string(),
            used_at: chrono::DateTime::<chrono::Utc>::from_timestamp(0, 0).unwrap(),
        }
    }

    #[test]
    fn dto_in_progress_hides_meta() {
        let a = sample_article();
        let dto = build_game_state_dto(&a, 1, 0, GameStatus::InProgress);
        assert_eq!(dto.total_sentences_num, 3);
        assert_eq!(dto.guesses_left_num, 4);
        assert_eq!(dto.revealed_sentences.len(), 1);
        assert_eq!(dto.revealed_sentences[0].index, 0);
        assert_eq!(dto.revealed_sentences[0].text, "_censoredWord_ is a film.");
        assert_eq!(dto.game_status, GameStatus::InProgress);
        assert!(dto.article_title.is_none());
        assert!(dto.article_url.is_none());
    }

    #[test]
    fn dto_won_reveals_meta_and_all_sentences() {
        let a = sample_article();
        let dto = build_game_state_dto(&a, 3, 2, GameStatus::Won);
        assert_eq!(dto.revealed_sentences.len(), 3);
        assert_eq!(dto.guesses_left_num, 2);
        assert_eq!(dto.article_title.as_deref(), Some("Shrek"));
        assert_eq!(
            dto.article_url.as_deref(),
            Some("https://en.wikipedia.org/wiki/Shrek")
        );
    }
}

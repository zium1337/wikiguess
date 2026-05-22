export interface ArticleStatsDto {
  total_guesses: number;
  average_guesses: number;
  player_count: number;
}

export interface ArticleDto {
  article_id: string;
  url: string;
  title: string;
  description: string;
  used_at: string;
}

export interface ArticleHistoryEntryDto {
  article: ArticleDto;
  stats: ArticleStatsDto;
}

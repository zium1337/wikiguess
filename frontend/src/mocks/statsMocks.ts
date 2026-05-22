import type { ArticleHistoryEntryDto } from "../models/StatsModels";

export const mockArticleHistory: ArticleHistoryEntryDto[] = [
  {
    article: {
      article_id: "mock-1",
      title: "Shrek",
      url: "https://en.wikipedia.org/wiki/Shrek_(film)",
      description: "",
      used_at: "2026-05-19T00:00:00Z",
    },
    stats: { player_count: 142, average_guesses: 2.3, total_guesses: 326 },
  },
  {
    article: {
      article_id: "mock-2",
      title: "Marie Curie",
      url: "https://en.wikipedia.org/wiki/Marie_Curie",
      description: "",
      used_at: "2026-05-18T00:00:00Z",
    },
    stats: { player_count: 98, average_guesses: 3.1, total_guesses: 304 },
  },
  {
    article: {
      article_id: "mock-3",
      title: "Mount Everest",
      url: "https://en.wikipedia.org/wiki/Mount_Everest",
      description: "",
      used_at: "2026-05-17T00:00:00Z",
    },
    stats: { player_count: 211, average_guesses: 1.8, total_guesses: 380 },
  },
  {
    article: {
      article_id: "mock-4",
      title: "The Beatles",
      url: "https://en.wikipedia.org/wiki/The_Beatles",
      description: "",
      used_at: "2026-05-16T00:00:00Z",
    },
    stats: { player_count: 175, average_guesses: 1.2, total_guesses: 210 },
  },
  {
    article: {
      article_id: "mock-5",
      title: "Black hole",
      url: "https://en.wikipedia.org/wiki/Black_hole",
      description: "",
      used_at: "2026-05-15T00:00:00Z",
    },
    stats: { player_count: 63, average_guesses: 3.8, total_guesses: 239 },
  },
  {
    article: {
      article_id: "mock-6",
      title: "Frozen",
      url: "https://en.wikipedia.org/wiki/Frozen_(2013_film)",
      description: "",
      used_at: "2026-05-14T00:00:00Z",
    },
    stats: { player_count: 175, average_guesses: 1.2, total_guesses: 210 },
  },
];

import { api } from "./AppService";
import type {
  ArticleStatsDto,
  ArticleHistoryEntryDto,
} from "../models/StatsModels";
import { cacheGet, cacheSet } from "../utils/cache";

const CACHE_KEY_TODAY_STATS = "wikiguess_today_stats";
const CACHE_KEY_HISTORY = "wikiguess_history";

const TTL_TODAY_STATS_MS = 60_000;
const TTL_HISTORY_MS = 10 * 60_000;

export const getTodayStats = async (): Promise<ArticleStatsDto> => {
  const cached = cacheGet<ArticleStatsDto>(CACHE_KEY_TODAY_STATS);
  if (cached) return cached;

  const response = await api.get<ArticleStatsDto>("/article/stats");
  cacheSet(CACHE_KEY_TODAY_STATS, response.data, TTL_TODAY_STATS_MS);
  return response.data;
};

export const getArticleHistory = async (): Promise<
  ArticleHistoryEntryDto[]
> => {
  const cached = cacheGet<ArticleHistoryEntryDto[]>(CACHE_KEY_HISTORY);
  if (cached) return cached;

  const response = await api.post<ArticleHistoryEntryDto[]>("/article/history");
  cacheSet(CACHE_KEY_HISTORY, response.data, TTL_HISTORY_MS);
  return response.data;
};

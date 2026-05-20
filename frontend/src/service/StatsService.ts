import { api } from "./AppService";
import type { ArticleStatsDto, ArticleHistoryEntryDto } from "../models/StatsModels";

export const getTodayStats = async (): Promise<ArticleStatsDto> => {
  const response = await api.get<ArticleStatsDto>("/article/stats");
  return response.data;
};

export const getArticleHistory = async (): Promise<ArticleHistoryEntryDto[]> => {
  const response = await api.post<ArticleHistoryEntryDto[]>("/article/history");
  return response.data;
};

import { useEffect, useState } from "react";
import { useLoading } from "../store/LoadingContext";
import { getTodayStats, getArticleHistory } from "../service/StatsService";
import type {
  ArticleStatsDto,
  ArticleHistoryEntryDto,
} from "../models/StatsModels";
import { mockArticleHistory } from "../mocks/statsMocks";

const PAGE_SIZE = 5;

function Stats() {
  const { setIsLoading } = useLoading();
  const [todayStats, setTodayStats] = useState<ArticleStatsDto>();
  const [history, setHistory] = useState<ArticleHistoryEntryDto[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getTodayStats(), getArticleHistory()])
      .then(([stats, hist]) => {
        setTodayStats(stats);
        setHistory(hist.length > 0 ? hist : mockArticleHistory);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center mt-20 gap-40">
      {todayStats && (
        <div className="flex gap-12 text-center">
          <div>
            <div className="text-5xl font-bold">{todayStats.player_count}</div>
            <div className="text-xl text-gray-600">players today</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className="text-5xl font-bold">
              {todayStats.average_guesses.toFixed(1)}
            </div>
            <div className="text-xl text-gray-600">avg guesses</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className="text-5xl font-bold">{todayStats.total_guesses}</div>
            <div className="text-xl text-gray-600">total guesses</div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="w-full max-w-5xl">
          <h2 className="text-4xl font-semibold mb-5">Past articles</h2>
          <table className="w-full text-xl">
            <thead>
              <tr className="border-b-2 border-gray-300 text-left text-gray-500">
                <th className="py-3 pr-6">Date</th>
                <th className="py-3 pr-6">Article</th>
                <th className="py-3 pr-6 text-right">Players</th>
                <th className="py-3 text-right">Avg guesses</th>
              </tr>
            </thead>
            <tbody>
              {(showAll ? history : history.slice(0, PAGE_SIZE)).map(
                (entry) => (
                  <tr
                    key={entry.article.article_id}
                    className="hover:bg-lime-100"
                  >
                    <td className="py-3 pr-6 text-gray-500">
                      {new Date(entry.article.used_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-6">
                      <a
                        href={entry.article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-lime-600"
                      >
                        {entry.article.title}
                      </a>
                    </td>
                    <td className="py-3 pr-6 text-right">
                      {entry.stats.player_count}
                    </td>
                    <td className="py-3 text-right">
                      {entry.stats.average_guesses.toFixed(1)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {history.length > PAGE_SIZE && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-10 text-xl text-lime-900 hover:text-lime-600 hover:cursor-pointer"
            >
              {showAll ? "Show less" : `Show all ${history.length} articles`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Stats;

import { RefreshCw } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface NewsItem {
  title: string;
  category: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "World leaders meet for climate summit discussions",
    category: "World",
  },
  {
    title: "Scientists discover new species in deep ocean exploration",
    category: "Science",
  },
  {
    title: "Space agency announces next lunar mission timeline",
    category: "Space",
  },
  {
    title: "Education technology reshaping classrooms worldwide",
    category: "Education",
  },
  {
    title: "Major sporting events scheduled across the globe this month",
    category: "Sports",
  },
  {
    title: "Renewable energy capacity reaches record levels globally",
    category: "Environment",
  },
  {
    title: "Reforestation efforts plant millions of trees across continents",
    category: "Environment",
  },
  {
    title: "International talks on trade agreements resume this week",
    category: "Economy",
  },
  {
    title: "Medical researchers make progress on new treatments",
    category: "Health",
  },
  {
    title: "Tech industry focuses on AI safety and regulation",
    category: "Technology",
  },
];

const CATEGORY_MAP: Record<string, string> = {
  tech: "Technology",
  ai: "Technology",
  software: "Technology",
  science: "Science",
  research: "Science",
  space: "Space",
  nasa: "Space",
  climate: "Environment",
  environment: "Environment",
  green: "Environment",
  health: "Health",
  medical: "Health",
  vaccine: "Health",
  sport: "Sports",
  football: "Sports",
  cricket: "Sports",
  economy: "Economy",
  market: "Economy",
  trade: "Economy",
  education: "Education",
  school: "Education",
  world: "World",
  war: "World",
  peace: "World",
};

function guessCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return cat;
  }
  return "World News";
}

const CACHE_KEY = "understandify_news_panel";
const CACHE_TS_KEY = "understandify_news_panel_ts";
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchNews(): Promise<NewsItem[]> {
  const rssUrls = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://www.aljazeera.com/xml/rss/all.xml",
  ];

  for (const url of rssUrls) {
    try {
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (!res.ok) continue;
      const data = await res.json();
      const xml = data.contents as string;
      if (!xml) continue;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const items = Array.from(doc.querySelectorAll("item"));
      const results: NewsItem[] = items
        .slice(0, 10)
        .map((item) => {
          const titleEl = item.querySelector("title");
          const title = titleEl?.textContent?.trim() ?? "";
          return { title, category: guessCategory(title) };
        })
        .filter((n) => n.title.length > 5);

      if (results.length > 0) return results;
    } catch {
      // try next source
    }
  }
  return [];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Technology: { bg: "oklch(0.25 0.12 220)", text: "oklch(0.75 0.20 210)" },
  Science: { bg: "oklch(0.22 0.10 195)", text: "oklch(0.75 0.18 195)" },
  Space: { bg: "oklch(0.20 0.08 270)", text: "oklch(0.72 0.18 265)" },
  Environment: { bg: "oklch(0.20 0.10 145)", text: "oklch(0.72 0.20 145)" },
  Health: { bg: "oklch(0.22 0.12 340)", text: "oklch(0.78 0.20 340)" },
  Sports: { bg: "oklch(0.22 0.12 45)", text: "oklch(0.82 0.20 45)" },
  Economy: { bg: "oklch(0.22 0.10 85)", text: "oklch(0.80 0.18 85)" },
  Education: { bg: "oklch(0.22 0.08 295)", text: "oklch(0.75 0.18 295)" },
  World: { bg: "oklch(0.20 0.06 265)", text: "oklch(0.65 0.10 265)" },
  "World News": { bg: "oklch(0.20 0.06 265)", text: "oklch(0.65 0.10 265)" },
};

function getCategoryStyle(category: string) {
  return (
    CATEGORY_COLORS[category] ?? {
      bg: "oklch(0.20 0.06 265)",
      text: "oklch(0.65 0.10 265)",
    }
  );
}

const NewsPanel: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNews = useCallback(async (force = false) => {
    if (!force) {
      // Check cache
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTs = localStorage.getItem(CACHE_TS_KEY);
      const now = Date.now();

      if (cached && cachedTs && now - Number(cachedTs) < REFRESH_INTERVAL_MS) {
        try {
          const parsed = JSON.parse(cached) as NewsItem[];
          if (parsed.length > 0) {
            setNews(parsed);
            setIsLoading(false);
            return;
          }
        } catch {
          // fall through
        }
      }
    }

    const fetched = await fetchNews();
    if (fetched.length > 0) {
      setNews(fetched);
      localStorage.setItem(CACHE_KEY, JSON.stringify(fetched));
      localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
    } else {
      setNews(FALLBACK_NEWS);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Clear cache to force fresh fetch
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TS_KEY);
    loadNews(true);
  };

  return (
    <div data-ocid="parent.news_panel" className="flex flex-col h-full">
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.22 0.06 265)" }}
      >
        <div>
          <h3
            className="font-fredoka text-lg font-bold"
            style={{ color: "oklch(0.88 0.03 265)" }}
          >
            📰 Latest News
          </h3>
          <p
            className="font-nunito text-xs font-semibold"
            style={{ color: "oklch(0.45 0.05 265)" }}
          >
            Current happenings around the world
          </p>
        </div>
        <button
          type="button"
          data-ocid="parent.news.refresh_button"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl font-nunito font-bold text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{
            background: "oklch(0.20 0.08 265)",
            border: "1px solid oklch(0.30 0.08 265)",
            color: "oklch(0.72 0.12 265)",
          }}
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* News list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          // Skeleton loading state
          <div data-ocid="parent.news.loading_state" className="space-y-2">
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((sk, i) => (
              <div
                key={sk}
                className="rounded-xl p-3 animate-pulse"
                style={{
                  background: "oklch(0.18 0.06 265)",
                  border: "1px solid oklch(0.25 0.07 265)",
                }}
              >
                <div
                  className="h-3 rounded mb-2"
                  style={{
                    background: "oklch(0.25 0.07 265)",
                    width: `${60 + (i % 3) * 15}%`,
                  }}
                />
                <div
                  className="h-3 rounded"
                  style={{
                    background: "oklch(0.22 0.06 265)",
                    width: `${40 + (i % 4) * 12}%`,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {news.slice(0, 10).map((item, index) => {
              const catStyle = getCategoryStyle(item.category);
              const ocidIndex = index + 1;
              return (
                <div
                  key={item.title.slice(0, 40)}
                  data-ocid={`parent.news.item.${ocidIndex}`}
                  className="rounded-xl p-3 transition-all hover:scale-[1.01] cursor-default"
                  style={{
                    background: "oklch(0.17 0.06 265)",
                    border: "1px solid oklch(0.26 0.07 265)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    {/* Category badge */}
                    <span
                      className="flex-shrink-0 font-nunito text-xs font-black px-2 py-0.5 rounded-full mt-0.5"
                      style={{
                        background: catStyle.bg,
                        color: catStyle.text,
                      }}
                    >
                      {item.category}
                    </span>
                    {/* Title */}
                    <p
                      className="font-nunito text-sm font-semibold leading-snug"
                      style={{ color: "oklch(0.82 0.03 265)" }}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
            {news.length === 0 && (
              <div
                data-ocid="parent.news.empty_state"
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <span className="text-4xl mb-3">📰</span>
                <p
                  className="font-nunito text-sm font-bold"
                  style={{ color: "oklch(0.55 0.05 265)" }}
                >
                  No news available right now
                </p>
                <p
                  className="font-nunito text-xs mt-1"
                  style={{ color: "oklch(0.40 0.04 265)" }}
                >
                  Tap refresh to try again
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPanel;

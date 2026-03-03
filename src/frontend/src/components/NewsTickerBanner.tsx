import type React from "react";
import { useEffect, useState } from "react";

const FALLBACK_HEADLINES = [
  "🌍 World leaders meet for climate summit discussions",
  "🔬 Scientists discover new species in deep ocean exploration",
  "🚀 Space agency announces next lunar mission timeline",
  "📚 Education technology reshaping classrooms worldwide",
  "🏆 Major sporting events scheduled across the globe this month",
  "💡 Renewable energy capacity reaches record levels globally",
  "🌱 Reforestation efforts plant millions of trees across continents",
  "🤝 International talks on trade agreements resume this week",
];

const CACHE_KEY = "understandify_news_headlines";
const CACHE_TS_KEY = "understandify_news_ts";
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchHeadlines(): Promise<string[]> {
  // Try fetching via a CORS proxy for RSS
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
      const titles = items
        .slice(0, 12)
        .map((item) => {
          const titleEl = item.querySelector("title");
          return titleEl?.textContent?.trim() ?? "";
        })
        .filter((t) => t.length > 5);

      if (titles.length > 0) return titles;
    } catch {
      // try next source
    }
  }
  return [];
}

const NewsTickerBanner: React.FC = () => {
  const [headlines, setHeadlines] = useState<string[]>(FALLBACK_HEADLINES);

  useEffect(() => {
    const loadHeadlines = async () => {
      // Check cache
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTs = localStorage.getItem(CACHE_TS_KEY);
      const now = Date.now();

      if (cached && cachedTs && now - Number(cachedTs) < REFRESH_INTERVAL_MS) {
        try {
          const parsed = JSON.parse(cached) as string[];
          if (parsed.length > 0) {
            setHeadlines(parsed);
            return;
          }
        } catch {
          // fall through to fetch
        }
      }

      const fetched = await fetchHeadlines();
      if (fetched.length > 0) {
        setHeadlines(fetched);
        localStorage.setItem(CACHE_KEY, JSON.stringify(fetched));
        localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
      } else {
        setHeadlines(FALLBACK_HEADLINES);
      }
    };

    loadHeadlines();
  }, []);

  const tickerText = headlines.join("  •  ");

  return (
    <div
      data-ocid="parent.news_ticker"
      className="relative overflow-hidden w-full"
      style={{
        background: "oklch(0.10 0.04 265 / 0.95)",
        borderBottom: "1px solid oklch(0.25 0.07 265)",
        height: "32px",
      }}
    >
      {/* "NEWS" badge */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 gap-1.5 flex-shrink-0"
        style={{
          background: "oklch(0.65 0.22 25)",
          borderRight: "2px solid oklch(0.78 0.22 25)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span
          className="font-nunito text-xs font-black tracking-widest uppercase"
          style={{ color: "oklch(0.98 0.01 0)" }}
        >
          NEWS
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="absolute inset-0 left-20 overflow-hidden flex items-center">
        <div className="animate-ticker whitespace-nowrap will-change-transform">
          <span
            className="font-nunito text-xs font-semibold"
            style={{ color: "oklch(0.78 0.05 265)" }}
          >
            {tickerText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsTickerBanner;

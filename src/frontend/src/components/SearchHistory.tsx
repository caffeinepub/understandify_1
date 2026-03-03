import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Search } from "lucide-react";
import type React from "react";
import { useQuestionHistory } from "../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function detectSubjectEmoji(question: string): string {
  const q = question.toLowerCase();
  if (
    /\d+\s*[+\-*/x]\s*\d+|math|add|subtract|multiply|divide|plus|minus/.test(q)
  )
    return "🔢";
  if (/science|biology|chemistry|physics|planet|space|atom|cell/.test(q))
    return "🔬";
  if (/history|ancient|war|civilization|king|queen|president/.test(q))
    return "📜";
  if (/geography|country|capital|continent|ocean|river|mountain/.test(q))
    return "🌍";
  if (/english|grammar|spelling|word|sentence|verb|noun/.test(q)) return "📝";
  if (/computer|technology|internet|code|robot|ai/.test(q)) return "💻";
  return "🌟";
}

const SearchHistory: React.FC = () => {
  const { data: history, isLoading, error } = useQuestionHistory();

  const sortedHistory = history
    ? [...history].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {["sk-a", "sk-b", "sk-c", "sk-d", "sk-e"].map((id) => (
          <Skeleton
            key={id}
            className="h-16 rounded-xl"
            style={{ background: "oklch(0.20 0.06 265)" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="text-4xl mb-3">⚠️</div>
        <p
          className="font-nunito font-semibold"
          style={{ color: "oklch(0.65 0.22 25)" }}
        >
          Could not load history. Please try again.
        </p>
      </div>
    );
  }

  if (sortedHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="text-5xl mb-4 animate-float">🔭</div>
        <h3
          className="font-fredoka text-xl font-bold mb-2"
          style={{ color: "oklch(0.82 0.18 85)" }}
        >
          No searches yet!
        </h3>
        <p
          className="font-nunito text-sm font-semibold"
          style={{ color: "oklch(0.55 0.05 265)" }}
        >
          When your child asks questions, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} style={{ color: "oklch(0.75 0.20 195)" }} />
          <span
            className="font-nunito text-sm font-bold"
            style={{ color: "oklch(0.75 0.20 195)" }}
          >
            {sortedHistory.length} question
            {sortedHistory.length !== 1 ? "s" : ""} asked
          </span>
        </div>

        {sortedHistory.map((record) => (
          <div
            key={`${record.question}-${record.timestamp.toString()}`}
            className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "oklch(0.18 0.05 265)",
              border: "1px solid oklch(0.28 0.07 265)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5 flex-shrink-0">
                {detectSubjectEmoji(record.question)}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-nunito text-sm font-semibold leading-snug mb-1 truncate"
                  style={{ color: "oklch(0.88 0.03 265)" }}
                >
                  {record.question}
                </p>
                <div className="flex items-center gap-1">
                  <Clock size={11} style={{ color: "oklch(0.50 0.05 265)" }} />
                  <span
                    className="font-nunito text-xs"
                    style={{ color: "oklch(0.50 0.05 265)" }}
                  >
                    {formatTimestamp(record.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SearchHistory;

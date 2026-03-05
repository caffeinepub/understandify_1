import { AnimatePresence } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRecordQuestion } from "../hooks/useQueries";
import { type AnswerResult, processQuestion } from "../lib/answerEngine";
import AnswerDisplay from "./AnswerDisplay";
import ImageGeneratorPanel from "./ImageGeneratorPanel";
import ParentNoticePanel from "./ParentNoticePanel";
import QuestionInput from "./QuestionInput";

interface QAEntry {
  id: number;
  question: string;
  result: AnswerResult;
}

interface ChildModeProps {
  onExitAttempt: () => void;
}

type ActiveTab = "learn" | "create";

const ChildMode: React.FC<ChildModeProps> = ({ onExitAttempt }) => {
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("learn");
  const [showParentPanel, setShowParentPanel] = useState(false);
  const recordQuestion = useRecordQuestion();

  // Intercept browser back/exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
      onExitAttempt();
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onExitAttempt]);

  const handleQuestion = useCallback(
    async (question: string) => {
      setIsProcessing(true);
      try {
        await recordQuestion.mutateAsync(question);
      } catch {
        // Continue even if backend fails
      }

      const result = processQuestion(question);
      setQaHistory((prev) => [{ id: Date.now(), question, result }, ...prev]);
      setIsProcessing(false);
    },
    [recordQuestion],
  );

  return (
    <div className="relative z-10 flex flex-col min-h-[calc(100vh-64px)]">
      {/* Tab bar */}
      <div
        className="flex gap-1 px-4 pt-3 pb-0"
        style={{ borderBottom: "1px solid oklch(0.22 0.06 265)" }}
      >
        <button
          type="button"
          data-ocid="child.learn_tab"
          onClick={() => setActiveTab("learn")}
          className="font-nunito text-sm font-bold px-4 py-2.5 rounded-t-xl transition-all relative"
          style={{
            background:
              activeTab === "learn" ? "oklch(0.16 0.05 265)" : "transparent",
            color:
              activeTab === "learn"
                ? "oklch(0.82 0.18 85)"
                : "oklch(0.55 0.05 265)",
            borderBottom:
              activeTab === "learn"
                ? "2px solid oklch(0.82 0.18 85)"
                : "2px solid transparent",
          }}
        >
          🚀 Ask &amp; Learn
        </button>
        <button
          type="button"
          data-ocid="child.create_tab"
          onClick={() => setActiveTab("create")}
          className="font-nunito text-sm font-bold px-4 py-2.5 rounded-t-xl transition-all"
          style={{
            background:
              activeTab === "create" ? "oklch(0.16 0.05 265)" : "transparent",
            color:
              activeTab === "create"
                ? "oklch(0.82 0.18 85)"
                : "oklch(0.55 0.05 265)",
            borderBottom:
              activeTab === "create"
                ? "2px solid oklch(0.82 0.18 85)"
                : "2px solid transparent",
          }}
        >
          🎨 Create
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "create" ? (
        <ImageGeneratorPanel />
      ) : (
        <>
          {/* Welcome banner */}
          {qaHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
              <div className="animate-float mb-6">
                <div className="text-7xl">🚀</div>
              </div>
              <h2
                className="font-fredoka text-3xl md:text-4xl font-bold mb-3"
                style={{ color: "oklch(0.82 0.18 85)" }}
              >
                Hello, Explorer! 👋
              </h2>
              <p
                className="font-nunito text-base md:text-lg font-semibold mb-2 max-w-md"
                style={{ color: "oklch(0.75 0.05 265)" }}
              >
                I'm your learning buddy! Ask me anything about math, science,
                history, geography, and more!
              </p>
              <div className="flex gap-3 text-2xl mt-2 mb-8">
                🔢 🔬 📜 🌍 📝 💻
              </div>

              {/* Input at bottom of welcome */}
              <div className="w-full max-w-2xl">
                <QuestionInput
                  onSubmit={handleQuestion}
                  isLoading={isProcessing}
                />
              </div>
            </div>
          )}

          {/* Q&A History */}
          {qaHistory.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 max-w-2xl mx-auto w-full">
              {qaHistory.map((entry) => (
                <div key={entry.id} className="space-y-3">
                  {/* Question bubble */}
                  <div className="flex justify-end">
                    <div
                      className="max-w-xs md:max-w-sm px-4 py-3 rounded-2xl rounded-tr-sm font-nunito text-base font-semibold"
                      style={{
                        background: "oklch(0.82 0.18 85 / 0.15)",
                        border: "1px solid oklch(0.82 0.18 85 / 0.4)",
                        color: "oklch(0.90 0.02 265)",
                      }}
                    >
                      {entry.question}
                    </div>
                  </div>

                  {/* Answer */}
                  <AnswerDisplay
                    question={entry.question}
                    result={entry.result}
                  />
                </div>
              ))}

              {/* Sticky input at bottom */}
              <div
                className="sticky bottom-0 pt-4 pb-2"
                style={{
                  background:
                    "linear-gradient(to top, oklch(0.10 0.04 265) 60%, transparent)",
                }}
              >
                <QuestionInput
                  onSubmit={handleQuestion}
                  isLoading={isProcessing}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Parent Notice button — bottom-right corner */}
      <button
        type="button"
        data-ocid="child.parent_notice.button"
        onClick={() => setShowParentPanel(true)}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full font-nunito font-bold text-sm transition-all hover:scale-105 active:scale-95"
        style={{
          background: "oklch(0.82 0.18 85)",
          color: "oklch(0.10 0.03 265)",
          boxShadow:
            "0 4px 16px oklch(0.82 0.18 85 / 0.45), 0 2px 8px oklch(0.05 0.02 265 / 0.5)",
        }}
        aria-label="Open parent controls"
      >
        🔐 Parent Notice
      </button>

      {/* Parent Notice Panel (bottom sheet) */}
      <AnimatePresence>
        {showParentPanel && (
          <ParentNoticePanel onClose={() => setShowParentPanel(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChildMode;

import type React from "react";
import type { AnswerResult } from "../lib/answerEngine";
import MathSocraticFlow from "./MathSocraticFlow";

interface AnswerDisplayProps {
  question: string;
  result: AnswerResult;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ question, result }) => {
  if (result.isFiltered) {
    return (
      <div
        className="rounded-2xl p-5 animate-slide-up"
        style={{
          background: "oklch(0.65 0.22 25 / 0.1)",
          border: "2px solid oklch(0.65 0.22 25 / 0.4)",
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <p
              className="font-nunito text-base font-semibold leading-relaxed"
              style={{ color: "oklch(0.88 0.03 265)" }}
            >
              {result.answer}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result.isMath && result.mathData) {
    return (
      <div className="animate-slide-up">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🔢</span>
          <span
            className="font-nunito text-sm font-bold px-3 py-1 rounded-full"
            style={{
              background: "oklch(0.82 0.18 85 / 0.15)",
              border: "1px solid oklch(0.82 0.18 85 / 0.4)",
              color: "oklch(0.82 0.18 85)",
            }}
          >
            Math Challenge
          </span>
        </div>
        <MathSocraticFlow question={question} mathData={result.mathData} />
      </div>
    );
  }

  // Format answer text with basic markdown-like rendering
  const formatAnswer = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={`bold-${i}-${part.slice(2, 10)}`}
            style={{ color: "oklch(0.82 0.18 85)", fontWeight: 800 }}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`text-${i}-${part.slice(0, 10)}`}>{part}</span>;
    });
  };

  const subjectColors: Record<string, string> = {
    Math: "oklch(0.82 0.18 85)",
    Science: "oklch(0.75 0.20 195)",
    History: "oklch(0.78 0.20 45)",
    Geography: "oklch(0.72 0.22 145)",
    English: "oklch(0.72 0.22 310)",
    Technology: "oklch(0.75 0.20 195)",
    "Health & Body": "oklch(0.72 0.22 340)",
    "Arts & Culture": "oklch(0.78 0.20 45)",
    "General Knowledge": "oklch(0.82 0.18 85)",
  };

  const subjectColor = subjectColors[result.subject] || "oklch(0.82 0.18 85)";

  return (
    <div
      className="rounded-2xl p-5 animate-slide-up"
      style={{
        background: "oklch(0.16 0.05 265)",
        border: "1px solid oklch(0.28 0.07 265)",
        borderLeft: `4px solid ${subjectColor}`,
      }}
    >
      {/* Subject badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{result.subjectEmoji}</span>
        <span
          className="font-nunito text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: `${subjectColor}20`,
            border: `1px solid ${subjectColor}60`,
            color: subjectColor,
          }}
        >
          {result.subject}
        </span>
      </div>

      {/* Answer text */}
      <p
        className="font-nunito text-base font-medium leading-relaxed"
        style={{ color: "oklch(0.88 0.03 265)" }}
      >
        {formatAnswer(result.answer)}
      </p>
    </div>
  );
};

export default AnswerDisplay;

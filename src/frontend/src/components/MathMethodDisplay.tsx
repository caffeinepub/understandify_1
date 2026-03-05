import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { type MathQuestion, getRandomEncouragement } from "../lib/mathEngine";

interface MathMethodDisplayProps {
  mathData: MathQuestion;
}

// ── Answer phase ──────────────────────────────────────────────────────────────
type AnswerPhase = "idle" | "awaiting" | "correct" | "hint" | "revealed";

// ── Confetti particle ────────────────────────────────────────────────────────
interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  drift: number;
}

const CONFETTI_COLORS = [
  "oklch(0.82 0.18 85)",
  "oklch(0.75 0.20 195)",
  "oklch(0.72 0.22 310)",
  "oklch(0.78 0.20 45)",
  "oklch(0.72 0.22 145)",
  "oklch(0.72 0.22 340)",
];

function makeConfetti(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.6,
    size: 6 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 60,
  }));
}

// ── Digit badge ───────────────────────────────────────────────────────────────
function DigitBadge({
  digit,
  place,
}: {
  digit: string;
  place: "units" | "tens" | "hundreds" | "op" | "line";
}) {
  const styles: Record<string, React.CSSProperties> = {
    units: {
      background: "oklch(0.82 0.18 85 / 0.20)",
      border: "1.5px solid oklch(0.82 0.18 85 / 0.70)",
      color: "oklch(0.92 0.18 85)",
    },
    tens: {
      background: "oklch(0.75 0.20 195 / 0.20)",
      border: "1.5px solid oklch(0.75 0.20 195 / 0.70)",
      color: "oklch(0.88 0.20 195)",
    },
    hundreds: {
      background: "oklch(0.72 0.22 310 / 0.20)",
      border: "1.5px solid oklch(0.72 0.22 310 / 0.70)",
      color: "oklch(0.88 0.22 310)",
    },
    op: {
      background: "transparent",
      border: "none",
      color: "oklch(0.72 0.22 145)",
    },
    line: {
      background: "transparent",
      border: "none",
      color: "transparent",
    },
  };

  return (
    <span
      className="inline-flex items-center justify-center rounded-md font-mono font-bold text-lg mx-0.5"
      style={{
        width: "2.2rem",
        height: "2.2rem",
        fontSize: "1.15rem",
        ...styles[place],
      }}
    >
      {digit}
    </span>
  );
}

// ── Written problem layout ────────────────────────────────────────────────────
function WrittenProblemLayout({
  num1,
  num2,
  operation,
}: {
  num1: number;
  num2: number;
  operation: string;
}) {
  const n1str = String(num1);
  const n2str = String(num2);
  const maxLen = Math.max(n1str.length, n2str.length);

  const placeOf = (digitIndex: number, total: number) => {
    const place = total - 1 - digitIndex;
    if (place === 0) return "units" as const;
    if (place === 1) return "tens" as const;
    return "hundreds" as const;
  };

  const opSymbols: Record<string, string> = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
    x: "×",
    "×": "×",
    "÷": "÷",
  };
  const opSymbol = opSymbols[operation] || operation;

  const renderRow = (numStr: string, withOp: boolean) => {
    const padded = numStr.padStart(maxLen, " ");
    return (
      <div className="flex items-center justify-end gap-0">
        {/* operator slot */}
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: "2.4rem",
            height: "2.2rem",
            color: "oklch(0.72 0.22 145)",
            fontSize: "1.3rem",
            fontWeight: 900,
          }}
        >
          {withOp ? opSymbol : ""}
        </span>
        {padded.split("").map((ch, i) => {
          const posKey = `digit-${withOp ? "b" : "a"}-${i}`;
          if (ch === " ") {
            return (
              <span
                key={posKey}
                style={{
                  width: "2.2rem",
                  height: "2.2rem",
                  display: "inline-block",
                }}
              />
            );
          }
          return (
            <DigitBadge
              key={posKey}
              digit={ch}
              place={placeOf(i, padded.length)}
            />
          );
        })}
      </div>
    );
  };

  // Dividing line
  const lineWidth = (maxLen + 1) * 2.4 + 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl p-5 mb-5"
      style={{
        background: "oklch(0.14 0.04 155)",
        border: "2px solid oklch(0.25 0.06 155)",
        boxShadow:
          "inset 0 2px 12px oklch(0.10 0.04 155 / 0.8), 0 0 20px oklch(0.14 0.04 155 / 0.5)",
      }}
    >
      <p
        className="font-nunito text-xs font-bold mb-3 tracking-widest uppercase"
        style={{ color: "oklch(0.50 0.08 155)" }}
      >
        📋 Written Method
      </p>
      <div className="flex flex-col items-end" style={{ gap: "0.25rem" }}>
        {/* num1 row */}
        {renderRow(n1str, false)}
        {/* num2 row with operator */}
        {renderRow(n2str, true)}
        {/* Horizontal dividing line */}
        <div
          className="my-1"
          style={{
            width: `${lineWidth}rem`,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, oklch(0.72 0.22 145 / 0.6) 20%, oklch(0.72 0.22 145) 50%, oklch(0.72 0.22 145 / 0.6) 80%, transparent)",
            borderRadius: "2px",
          }}
        />
      </div>
    </motion.div>
  );
}

// ── Place-value legend ────────────────────────────────────────────────────────
function PlaceValueLegend() {
  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {(
        [
          {
            label: "Units",
            color: "oklch(0.82 0.18 85)",
            bg: "oklch(0.82 0.18 85 / 0.15)",
            border: "oklch(0.82 0.18 85 / 0.50)",
          },
          {
            label: "Tens",
            color: "oklch(0.75 0.20 195)",
            bg: "oklch(0.75 0.20 195 / 0.15)",
            border: "oklch(0.75 0.20 195 / 0.50)",
          },
          {
            label: "Hundreds",
            color: "oklch(0.72 0.22 310)",
            bg: "oklch(0.72 0.22 310 / 0.15)",
            border: "oklch(0.72 0.22 310 / 0.50)",
          },
        ] as const
      ).map((item) => (
        <span
          key={item.label}
          className="text-xs font-nunito font-bold px-3 py-1 rounded-full"
          style={{
            background: item.bg,
            border: `1px solid ${item.border}`,
            color: item.color,
          }}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ── Individual step row ───────────────────────────────────────────────────────
function StepRow({
  step,
  index,
  isPartialProduct,
}: {
  step: {
    label: string;
    expression: string;
    result: number;
    note: string;
    color: string;
    indent?: number;
  };
  index: number;
  isPartialProduct: boolean;
}) {
  const indentPx = (step.indent ?? 0) * 28;

  return (
    <motion.div
      data-ocid={`math.step.${index + 1}`}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-xl p-3 mb-2"
      style={{
        background: `${step.color.replace(")", " / 0.08)")}`,
        border: `1.5px solid ${step.color.replace(")", " / 0.35)")}`,
        marginLeft: `${indentPx}px`,
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Step badge */}
        <span
          className="text-xs font-nunito font-black px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: `${step.color.replace(")", " / 0.20)")}`,
            border: `1px solid ${step.color.replace(")", " / 0.50)")}`,
            color: step.color,
          }}
        >
          {step.label}
        </span>

        {/* Shift indicator for partial products */}
        {isPartialProduct && (step.indent ?? 0) > 0 && (
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded"
            style={{
              background: "oklch(0.75 0.20 195 / 0.15)",
              color: "oklch(0.75 0.20 195)",
              border: "1px solid oklch(0.75 0.20 195 / 0.35)",
            }}
          >
            {"←".repeat(step.indent ?? 0)} shift
          </span>
        )}

        {/* Expression → result */}
        <div className="flex items-center gap-2">
          <span
            className="font-mono font-bold text-base"
            style={{ color: step.color }}
          >
            {step.expression}
          </span>
          <span style={{ color: "oklch(0.55 0.05 265)" }}>=</span>
          <span
            className="font-mono font-black text-lg"
            style={{
              color: step.color,
              textShadow: `0 0 12px ${step.color.replace(")", " / 0.5)")}`,
            }}
          >
            {step.result}
          </span>
        </div>
      </div>

      {/* Note */}
      <p
        className="font-nunito text-xs font-semibold mt-1.5 leading-snug"
        style={{
          color: "oklch(0.65 0.06 265)",
          paddingLeft: "0.25rem",
        }}
      >
        💡 {step.note}
      </p>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const MathMethodDisplay: React.FC<MathMethodDisplayProps> = ({ mathData }) => {
  const method = mathData.method;
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [answerPhase, setAnswerPhase] = useState<AnswerPhase>("idle");
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [userInput, setUserInput] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [encouragement] = useState(() => getRandomEncouragement(true));
  const inputRef = useRef<HTMLInputElement>(null);

  // Staggered step reveal
  useEffect(() => {
    if (!method) return;
    setVisibleSteps(0);
    setAnswerPhase("idle");
    setUserInput("");
    setAttemptCount(0);

    const timers: ReturnType<typeof setTimeout>[] = [];
    method.steps.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => setVisibleSteps((prev) => Math.max(prev, i + 1)),
          800 * (i + 1),
        ),
      );
    });

    // After all steps animate in, switch to awaiting phase (same beat as before)
    timers.push(
      setTimeout(
        () => {
          setAnswerPhase("awaiting");
        },
        800 * (method.steps.length + 1) + 400,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [method]);

  // Focus the input when phase becomes awaiting or hint
  useEffect(() => {
    if (answerPhase === "awaiting" || answerPhase === "hint") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [answerPhase]);

  // Handle answer submission
  const handleCheckAnswer = () => {
    if (!mathData.answer === undefined || userInput.trim() === "") return;

    const correctStr = String(mathData.answer);
    const isCorrect = userInput.trim() === correctStr;

    if (isCorrect) {
      setAnswerPhase("correct");
      setConfetti(makeConfetti(28));
      setTimeout(() => setConfetti([]), 2800);
    } else if (attemptCount === 0) {
      // First wrong attempt → hint
      setAttemptCount(1);
      setAnswerPhase("hint");
      setUserInput("");
    } else {
      // Second wrong attempt → reveal
      setAnswerPhase("revealed");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheckAnswer();
    }
  };

  // No method data fallback
  if (!method) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: "oklch(0.16 0.05 265)",
          border: "1px solid oklch(0.30 0.07 265)",
        }}
      >
        <div className="text-4xl mb-3">🔢</div>
        <p
          className="font-nunito font-semibold"
          style={{ color: "oklch(0.75 0.05 265)" }}
        >
          {mathData.expression} ={" "}
          <strong style={{ color: "oklch(0.82 0.18 85)" }}>
            {mathData.answer}
          </strong>
        </p>
      </div>
    );
  }

  const isMultiplication = method.operation === "*";
  const displayedSteps = method.steps.slice(0, visibleSteps);

  return (
    <div
      data-ocid="math.method_display"
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.13 0.05 265)",
        border: "1.5px solid oklch(0.28 0.07 265)",
        boxShadow:
          "0 0 40px oklch(0.10 0.04 265 / 0.6), 0 8px 32px oklch(0.05 0.02 265 / 0.4)",
      }}
    >
      {/* Confetti burst */}
      <AnimatePresence>
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            className="absolute pointer-events-none rounded-sm"
            initial={{ y: 0, x: `${c.x}%`, opacity: 1, rotate: 0 }}
            animate={{
              y: 260,
              x: `calc(${c.x}% + ${c.drift}px)`,
              opacity: 0,
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 + c.delay, ease: "easeIn" }}
            style={{
              top: 0,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              zIndex: 30,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid oklch(0.22 0.06 265)" }}
      >
        <div className="flex items-start gap-3 flex-wrap">
          <div
            className="flex items-center justify-center rounded-xl text-2xl"
            style={{
              width: "3rem",
              height: "3rem",
              background: "oklch(0.82 0.18 85 / 0.15)",
              border: "1.5px solid oklch(0.82 0.18 85 / 0.50)",
              flexShrink: 0,
            }}
          >
            🧮
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-fredoka text-xl font-bold leading-tight"
              style={{ color: "oklch(0.82 0.18 85)" }}
            >
              {method.methodName}
            </h3>
            <p
              className="font-nunito text-sm font-medium mt-0.5"
              style={{ color: "oklch(0.60 0.06 265)" }}
            >
              {method.methodDescription}
            </p>
          </div>
          {/* Question chip */}
          <div
            className="shrink-0 px-4 py-1.5 rounded-xl font-mono font-black text-lg"
            style={{
              background: "oklch(0.18 0.06 265)",
              border: "1.5px solid oklch(0.35 0.08 265)",
              color: "oklch(0.82 0.18 85)",
              boxShadow: "0 0 12px oklch(0.82 0.18 85 / 0.2)",
            }}
          >
            {mathData.expression} = ?
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        {/* Written problem */}
        <WrittenProblemLayout
          num1={method.num1}
          num2={method.num2}
          operation={method.operation}
        />

        {/* Place value legend */}
        <PlaceValueLegend />

        {/* Steps */}
        <div className="mb-2">
          <p
            className="font-nunito text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.40 0.06 265)" }}
          >
            ✏️ Step-by-Step Workings
          </p>

          <AnimatePresence>
            {displayedSteps.map((step, i) => (
              <StepRow
                key={`${step.label}-${i}`}
                step={step}
                index={i}
                isPartialProduct={isMultiplication}
              />
            ))}
          </AnimatePresence>

          {/* Pending steps placeholder */}
          {visibleSteps < method.steps.length && (
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
              className="flex items-center gap-2 mt-2"
            >
              <span className="text-lg">⏳</span>
              <span
                className="font-nunito text-sm font-semibold"
                style={{ color: "oklch(0.45 0.06 265)" }}
              >
                Next step coming…
              </span>
            </motion.div>
          )}
        </div>

        {/* Partial products addition display (multiplication only) */}
        {isMultiplication &&
          visibleSteps >= method.steps.length &&
          answerPhase === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 rounded-xl p-3"
              style={{
                background: "oklch(0.72 0.22 145 / 0.08)",
                border: "1.5px dashed oklch(0.72 0.22 145 / 0.40)",
              }}
            >
              <p
                className="font-nunito text-xs font-bold mb-1"
                style={{ color: "oklch(0.72 0.22 145)" }}
              >
                ➕ Adding partial products…
              </p>
            </motion.div>
          )}

        {/* ── Interactive Answer Input ── */}
        <AnimatePresence>
          {(answerPhase === "awaiting" || answerPhase === "hint") && (
            <motion.div
              key="answer-input"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="mt-5 rounded-2xl p-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.16 0.06 195 / 0.5), oklch(0.14 0.05 265) 60%, oklch(0.16 0.06 310 / 0.3))",
                border: "2px solid oklch(0.75 0.20 195 / 0.50)",
                boxShadow: "0 0 24px oklch(0.75 0.20 195 / 0.15)",
              }}
            >
              {/* Hint message (shown on second attempt) */}
              {answerPhase === "hint" && (
                <motion.div
                  data-ocid="math.hint_state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{
                    background: "oklch(0.78 0.20 45 / 0.12)",
                    border: "1.5px solid oklch(0.78 0.20 45 / 0.45)",
                  }}
                >
                  <span className="text-xl shrink-0">🤔</span>
                  <p
                    className="font-nunito text-sm font-semibold leading-snug"
                    style={{ color: "oklch(0.88 0.18 55)" }}
                  >
                    Not quite! Take another look at the steps above and try
                    again — you can do it!
                  </p>
                </motion.div>
              )}

              {/* Prompt */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚀</span>
                <p
                  className="font-fredoka text-lg font-bold"
                  style={{ color: "oklch(0.88 0.12 195)" }}
                >
                  Now it&apos;s your turn! What is the answer?
                </p>
              </div>

              {/* Attempt counter */}
              {answerPhase === "hint" && (
                <p
                  className="font-nunito text-xs font-bold mb-3 tracking-wide"
                  style={{ color: "oklch(0.55 0.08 265)" }}
                >
                  Attempt 2 of 2 — last chance before I reveal it!
                </p>
              )}

              {/* Input row */}
              <div className="flex gap-3 items-center flex-wrap">
                <input
                  ref={inputRef}
                  data-ocid="math.answer_input"
                  type="number"
                  inputMode="numeric"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer…"
                  className="flex-1 min-w-0 rounded-xl px-4 py-3 font-mono font-bold text-lg outline-none transition-all duration-200"
                  style={{
                    background: "oklch(0.10 0.04 265)",
                    border: "2px solid oklch(0.35 0.08 195)",
                    color: "oklch(0.92 0.12 195)",
                    caretColor: "oklch(0.75 0.20 195)",
                    minWidth: "120px",
                  }}
                  onFocus={(e) => {
                    e.target.style.border =
                      "2px solid oklch(0.75 0.20 195 / 0.90)";
                    e.target.style.boxShadow =
                      "0 0 0 3px oklch(0.75 0.20 195 / 0.20)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "2px solid oklch(0.35 0.08 195)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  data-ocid="math.check_answer_button"
                  onClick={handleCheckAnswer}
                  disabled={userInput.trim() === ""}
                  className="shrink-0 px-5 py-3 rounded-xl font-fredoka font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "oklch(0.75 0.20 195)",
                    color: "oklch(0.10 0.04 265)",
                    boxShadow: "0 4px 16px oklch(0.75 0.20 195 / 0.35)",
                  }}
                  onMouseEnter={(e) => {
                    if (userInput.trim() !== "") {
                      (e.target as HTMLButtonElement).style.background =
                        "oklch(0.82 0.20 195)";
                      (e.target as HTMLButtonElement).style.boxShadow =
                        "0 6px 20px oklch(0.75 0.20 195 / 0.50)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                      "oklch(0.75 0.20 195)";
                    (e.target as HTMLButtonElement).style.boxShadow =
                      "0 4px 16px oklch(0.75 0.20 195 / 0.35)";
                  }}
                >
                  Check My Answer ✓
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Correct Answer ── */}
        <AnimatePresence>
          {answerPhase === "correct" && (
            <motion.div
              data-ocid="math.correct_state"
              key="correct"
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="mt-5 rounded-2xl p-5 text-center relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.06 85 / 0.6), oklch(0.16 0.05 265) 60%, oklch(0.18 0.06 195 / 0.4))",
                border: "2px solid oklch(0.82 0.18 85 / 0.60)",
                boxShadow:
                  "0 0 30px oklch(0.82 0.18 85 / 0.30), 0 0 60px oklch(0.82 0.18 85 / 0.12)",
              }}
            >
              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, oklch(0.82 0.18 85 / 0.12) 0%, transparent 70%)",
                }}
              />
              <div className="text-4xl mb-2">🎉</div>
              <p
                className="font-nunito text-sm font-bold mb-2 tracking-wide"
                style={{ color: "oklch(0.65 0.08 265)" }}
              >
                CORRECT!
              </p>
              <div
                className="inline-block px-6 py-3 rounded-2xl font-fredoka text-3xl md:text-4xl font-bold mb-3"
                style={{
                  background: "oklch(0.82 0.18 85 / 0.12)",
                  border: "2px solid oklch(0.82 0.18 85 / 0.60)",
                  color: "oklch(0.92 0.18 85)",
                  textShadow:
                    "0 0 20px oklch(0.82 0.18 85 / 0.70), 0 0 40px oklch(0.82 0.18 85 / 0.35)",
                }}
              >
                {method.finalExpression}
              </div>
              <p
                className="font-nunito text-base font-semibold"
                style={{ color: "oklch(0.75 0.08 265)" }}
              >
                {encouragement}
              </p>
              <div className="flex justify-center gap-2 mt-3 text-xl">
                🌟 🚀 ⭐ 🏆 🌟
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Revealed Answer (after 2 failed attempts) ── */}
        <AnimatePresence>
          {answerPhase === "revealed" && (
            <motion.div
              data-ocid="math.revealed_state"
              key="revealed"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mt-5 rounded-2xl p-5 text-center relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.16 0.06 310 / 0.4), oklch(0.14 0.05 265) 60%, oklch(0.16 0.05 195 / 0.3))",
                border: "2px solid oklch(0.72 0.22 310 / 0.50)",
                boxShadow: "0 0 24px oklch(0.72 0.22 310 / 0.18)",
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.22 310 / 0.10) 0%, transparent 70%)",
                }}
              />
              <div className="text-4xl mb-2">🌟</div>
              <p
                className="font-nunito text-sm font-bold mb-3 tracking-wide"
                style={{ color: "oklch(0.55 0.08 265)" }}
              >
                GREAT EFFORT!
              </p>
              <div
                className="inline-block px-6 py-3 rounded-2xl font-fredoka text-3xl md:text-4xl font-bold mb-3"
                style={{
                  background: "oklch(0.72 0.22 310 / 0.12)",
                  border: "2px solid oklch(0.72 0.22 310 / 0.55)",
                  color: "oklch(0.90 0.18 310)",
                  textShadow:
                    "0 0 20px oklch(0.72 0.22 310 / 0.60), 0 0 40px oklch(0.72 0.22 310 / 0.30)",
                }}
              >
                {method.finalExpression}
              </div>
              <p
                className="font-nunito text-base font-semibold"
                style={{ color: "oklch(0.72 0.08 265)" }}
              >
                {getRandomEncouragement(false)}
              </p>
              <p
                className="font-nunito text-sm font-medium mt-2"
                style={{ color: "oklch(0.55 0.06 265)" }}
              >
                Keep practising and you&apos;ll get it next time! 💪
              </p>
              <div className="flex justify-center gap-2 mt-3 text-xl">
                💪 📚 ✨ 🔢 🚀
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MathMethodDisplay;

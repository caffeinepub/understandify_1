import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type React from "react";
import { useEffect, useState } from "react";
import {
  type MathQuestion,
  getRandomEncouragement,
  validateAnswer,
} from "../lib/mathEngine";

interface MathSocraticFlowProps {
  question: string;
  mathData: MathQuestion;
}

type FlowStep = "hint1" | "hint2" | "revealed";

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
}

const MathSocraticFlow: React.FC<MathSocraticFlowProps> = ({ mathData }) => {
  const [step, setStep] = useState<FlowStep>("hint1");
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [, setCelebration] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [attempts, setAttempts] = useState(0);

  const confettiColors = [
    "oklch(0.82 0.18 85)",
    "oklch(0.75 0.20 195)",
    "oklch(0.72 0.22 310)",
    "oklch(0.78 0.20 45)",
    "oklch(0.72 0.22 340)",
  ];

  const triggerCelebration = () => {
    setCelebration(true);
    setConfetti(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color:
          confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
      })),
    );
    setTimeout(() => {
      setCelebration(false);
      setConfetti([]);
    }, 2000);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim() || mathData.answer === undefined) return;

    const correct = validateAnswer(userAnswer, mathData.answer);
    setAttempts((prev) => prev + 1);

    if (correct) {
      setIsCorrect(true);
      triggerCelebration();
    } else {
      setIsCorrect(false);
      if (step === "hint1") {
        setTimeout(() => {
          setStep("hint2");
          setUserAnswer("");
          setIsCorrect(null);
        }, 1500);
      } else if (step === "hint2") {
        setTimeout(() => {
          setStep("revealed");
          setUserAnswer("");
          setIsCorrect(null);
        }, 1500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const currentHint = step === "hint1" ? mathData.hint1 : mathData.hint2;

  if (isCorrect === true) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-center animate-bounce-in"
        style={{
          background: "oklch(0.82 0.18 85 / 0.1)",
          border: "2px solid oklch(0.82 0.18 85)",
          boxShadow: "0 0 30px oklch(0.82 0.18 85 / 0.3)",
        }}
      >
        {/* Confetti */}
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute w-3 h-3 rounded-sm animate-confetti"
            style={{
              left: `${c.x}%`,
              top: "0",
              backgroundColor: c.color,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

        <div className="text-6xl mb-3">🎉</div>
        <h3
          className="font-fredoka text-2xl font-bold mb-2"
          style={{ color: "oklch(0.82 0.18 85)" }}
        >
          {mathData.expression} = {mathData.answer}
        </h3>
        <p
          className="font-nunito text-base font-semibold"
          style={{ color: "oklch(0.85 0.05 265)" }}
        >
          {getRandomEncouragement(true)}
        </p>
        <div className="flex justify-center gap-2 mt-3 text-2xl">
          🌟 🚀 ⭐ 🏆 🌟
        </div>
      </div>
    );
  }

  if (step === "revealed") {
    return (
      <div
        className="rounded-2xl p-6 animate-slide-up"
        style={{
          background: "oklch(0.75 0.20 195 / 0.1)",
          border: "2px solid oklch(0.75 0.20 195)",
          boxShadow: "0 0 20px oklch(0.75 0.20 195 / 0.2)",
        }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💡</div>
          <p
            className="font-nunito text-sm font-semibold mb-3"
            style={{ color: "oklch(0.75 0.20 195)" }}
          >
            No worries! Here's the answer:
          </p>
          <div
            className="inline-block px-6 py-3 rounded-2xl font-fredoka text-3xl font-bold"
            style={{
              background: "oklch(0.75 0.20 195 / 0.15)",
              border: "2px solid oklch(0.75 0.20 195)",
              color: "oklch(0.82 0.18 85)",
            }}
          >
            {mathData.expression} ={" "}
            <span style={{ color: "oklch(0.82 0.18 85)" }}>
              {mathData.answer}
            </span>
          </div>
        </div>
        <p
          className="font-nunito text-sm text-center font-semibold"
          style={{ color: "oklch(0.75 0.05 265)" }}
        >
          {getRandomEncouragement(false)}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 animate-slide-up"
      style={{
        background: "oklch(0.16 0.05 265)",
        border: "1px solid oklch(0.30 0.07 265)",
      }}
    >
      {/* Question display */}
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">🤔</div>
        <div
          className="inline-block px-5 py-2 rounded-xl font-fredoka text-2xl font-bold"
          style={{
            background: "oklch(0.20 0.06 265)",
            border: "1px solid oklch(0.35 0.08 265)",
            color: "oklch(0.82 0.18 85)",
          }}
        >
          {mathData.expression} = ?
        </div>
      </div>

      {/* Hint */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background:
            step === "hint1"
              ? "oklch(0.78 0.20 45 / 0.1)"
              : "oklch(0.72 0.22 310 / 0.1)",
          border: `1px solid ${step === "hint1" ? "oklch(0.78 0.20 45 / 0.4)" : "oklch(0.72 0.22 310 / 0.4)"}`,
        }}
      >
        <p
          className="font-nunito text-sm font-semibold leading-relaxed"
          style={{ color: "oklch(0.88 0.03 265)" }}
        >
          {step === "hint1" ? "💡 Hint 1:" : "🌟 Hint 2:"} {currentHint}
        </p>
      </div>

      {/* Wrong answer feedback */}
      {isCorrect === false && (
        <div
          className="rounded-xl p-3 mb-4 text-center animate-slide-up"
          style={{
            background: "oklch(0.65 0.22 25 / 0.1)",
            border: "1px solid oklch(0.65 0.22 25 / 0.3)",
          }}
        >
          <p
            className="font-nunito text-sm font-semibold"
            style={{ color: "oklch(0.75 0.22 25)" }}
          >
            Not quite! Try again with the hint! 💪
          </p>
        </div>
      )}

      {/* Answer input */}
      <div className="flex gap-3">
        <Input
          type="number"
          placeholder="Your answer..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 font-nunito text-lg font-bold text-center rounded-xl"
          style={{
            background: "oklch(0.20 0.06 265)",
            border: "2px solid oklch(0.35 0.08 265)",
            color: "oklch(0.90 0.02 265)",
            height: "52px",
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          className="px-6 rounded-xl font-nunito font-bold text-base transition-all hover:scale-105"
          style={{
            background: "oklch(0.82 0.18 85)",
            color: "oklch(0.12 0.04 265)",
            height: "52px",
            border: "none",
          }}
        >
          Check! 🚀
        </Button>
      </div>

      <p
        className="font-nunito text-xs text-center mt-3"
        style={{ color: "oklch(0.50 0.05 265)" }}
      >
        Attempt {attempts + 1} of 2 before answer is revealed
      </p>
    </div>
  );
};

export default MathSocraticFlow;

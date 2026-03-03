export interface MathQuestion {
  isMath: boolean;
  expression?: string;
  answer?: number;
  hint1?: string;
  hint2?: string;
  operation?: string;
}

const ENCOURAGING_CORRECT = [
  "🌟 Amazing! You got it right! You're a math superstar!",
  "🚀 Blast off! That's correct! You're so smart!",
  "⭐ Wow! Perfect answer! You're out of this world!",
  "🎉 Fantastic! You nailed it! Keep shining bright!",
  "🏆 Incredible! You're a champion! Great job!",
];

const ENCOURAGING_REVEAL = [
  "No worries! Learning takes practice. You'll get it next time! 💪",
  "That's okay! Every astronaut learns step by step! Keep going! 🚀",
  "Don't give up! You're getting smarter every day! ⭐",
  "It's okay to make mistakes — that's how we learn! You're doing great! 🌟",
];

export function getRandomEncouragement(correct: boolean): string {
  const arr = correct ? ENCOURAGING_CORRECT : ENCOURAGING_REVEAL;
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateHints(
  num1: number,
  num2: number,
  operation: string,
): { hint1: string; hint2: string } {
  if (operation === "+") {
    return {
      hint1: `🍎 Imagine you have ${num1} apples and someone gives you ${num2} more apples. How many apples do you have now? Count them all together!`,
      hint2: `✋ Hold up ${num1} fingers on one hand (or use both hands!), then count ${num2} more fingers. How many fingers are up in total?`,
    };
  }
  if (operation === "-") {
    return {
      hint1: `🍪 Imagine you have ${num1} cookies and you eat ${num2} of them. How many cookies are left on the plate?`,
      hint2: `🌟 Start at ${num1} and count backwards ${num2} steps. What number do you land on?`,
    };
  }
  if (operation === "*" || operation === "x") {
    return {
      hint1: `🎁 Imagine you have ${num1} bags and each bag has ${num2} toys inside. How many toys do you have altogether?`,
      hint2: `🔢 Try adding ${num2} together ${num1} times: ${Array(num1).fill(num2).join(" + ")} = ?`,
    };
  }
  if (operation === "/") {
    return {
      hint1: `🍕 Imagine you have ${num1} pizza slices and you want to share them equally among ${num2} friends. How many slices does each friend get?`,
      hint2: `🔢 How many times does ${num2} fit into ${num1}? Count by ${num2}s until you reach ${num1}!`,
    };
  }
  return {
    hint1: `🤔 Think carefully about the numbers ${num1} and ${num2}. What happens when you work with them?`,
    hint2:
      "💡 Try using your fingers or drawing dots to help you figure it out!",
  };
}

export function detectMathQuestion(question: string): MathQuestion {
  const q = question.trim().toLowerCase();

  // Match patterns like "10 + 10", "10+10", "what is 5 * 3", "10 plus 10", etc.
  const patterns = [
    // Direct arithmetic: 10 + 10, 5-3, 4*2, 8/2
    /(\d+)\s*([+\-*/x×÷])\s*(\d+)/,
    // "what is X plus/minus/times/divided by Y"
    /what\s+is\s+(\d+)\s+(plus|minus|times|multiplied by|divided by)\s+(\d+)/i,
    // "X plus/minus/times/divided by Y"
    /(\d+)\s+(plus|minus|times|multiplied by|divided by)\s+(\d+)/i,
    // "X and Y" addition context
    /(\d+)\s+and\s+(\d+)/i,
    // equals question mark
    /(\d+)\s*([+\-*/x×÷])\s*(\d+)\s*=\s*\?/,
  ];

  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (match) {
      let num1: number;
      let num2: number;
      let op: string;

      if (
        match[2] &&
        ["plus", "minus", "times", "multiplied by", "divided by"].includes(
          match[2].toLowerCase(),
        )
      ) {
        num1 = Number.parseInt(match[1]);
        num2 = Number.parseInt(match[3]);
        const opWord = match[2].toLowerCase();
        if (opWord === "plus") op = "+";
        else if (opWord === "minus") op = "-";
        else if (opWord === "times" || opWord === "multiplied by") op = "*";
        else op = "/";
      } else {
        num1 = Number.parseInt(match[1]);
        op = match[2] || "+";
        num2 = Number.parseInt(match[3]);
      }

      if (Number.isNaN(num1) || Number.isNaN(num2)) continue;

      let answer: number;
      if (op === "+") answer = num1 + num2;
      else if (op === "-") answer = num1 - num2;
      else if (op === "*" || op === "x" || op === "×") answer = num1 * num2;
      else if (op === "/" || op === "÷")
        answer = num2 !== 0 ? num1 / num2 : Number.NaN;
      else answer = num1 + num2;

      if (Number.isNaN(answer)) continue;

      const { hint1, hint2 } = generateHints(
        num1,
        num2,
        op === "x" || op === "×" ? "*" : op === "÷" ? "/" : op,
      );

      return {
        isMath: true,
        expression: `${num1} ${op} ${num2}`,
        answer,
        hint1,
        hint2,
        operation: op,
      };
    }
  }

  // Check for math keywords
  const mathKeywords = [
    "calculate",
    "solve",
    "math",
    "add",
    "subtract",
    "multiply",
    "divide",
    "sum",
    "difference",
    "product",
    "quotient",
    "equals",
    "equation",
  ];
  const hasMathKeyword = mathKeywords.some((kw) => q.includes(kw));

  if (hasMathKeyword) {
    return { isMath: true };
  }

  return { isMath: false };
}

export function validateAnswer(
  userAnswer: string,
  correctAnswer: number,
): boolean {
  const cleaned = userAnswer.trim().replace(/[^0-9.\-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) return false;
  return Math.abs(parsed - correctAnswer) < 0.01;
}

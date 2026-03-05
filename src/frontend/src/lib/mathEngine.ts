export interface MathMethodStep {
  label: string;
  expression: string;
  result: number;
  note: string;
  color: string;
  indent?: number; // pixel offset for partial product alignment
}

export interface MathMethod {
  steps: MathMethodStep[];
  finalAnswer: number;
  finalExpression: string;
  methodName: string;
  methodDescription: string;
  num1: number;
  num2: number;
  operation: string;
}

export interface MathQuestion {
  isMath: boolean;
  expression?: string;
  answer?: number;
  hint1?: string;
  hint2?: string;
  operation?: string;
  method?: MathMethod;
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

const AMBER = "oklch(0.82 0.18 85)";
const CYAN = "oklch(0.75 0.20 195)";
const PURPLE = "oklch(0.72 0.22 310)";
const GREEN = "oklch(0.72 0.22 145)";
const ORANGE = "oklch(0.78 0.20 45)";

export function generateMethodSteps(
  num1: number,
  num2: number,
  op: string,
): MathMethod {
  const normalOp = op === "x" || op === "×" ? "*" : op === "÷" ? "/" : op;

  // ── MULTIPLICATION ──────────────────────────────────────────────────────────
  if (normalOp === "*") {
    const answer = num1 * num2;
    const units2 = num2 % 10;
    const tens2 = Math.floor(num2 / 10);
    const hundreds2 = Math.floor(num2 / 100);

    const steps: MathMethodStep[] = [];

    // Step: units row  →  num1 × units2
    const unitsProduct = num1 * units2;
    steps.push({
      label: "Step 1",
      expression: `${num1} × ${units2}`,
      result: unitsProduct,
      note: `Units digit of ${num2} is ${units2} — multiply ${num1} × ${units2}`,
      color: AMBER,
      indent: 0,
    });

    // Step: tens row  →  num1 × tens2, shifted left by 1
    if (tens2 > 0) {
      const tensProduct = num1 * tens2 * 10;
      steps.push({
        label: "Step 2",
        expression: `${num1} × ${tens2} × 10`,
        result: tensProduct,
        note: `Tens digit of ${num2} is ${tens2} — multiply ${num1} × ${tens2} = ${num1 * tens2}, then × 10 (shift left) = ${tensProduct}`,
        color: CYAN,
        indent: 1,
      });
    }

    // Step: hundreds row (if any)
    if (hundreds2 > 0) {
      const hundredsProduct = num1 * hundreds2 * 100;
      steps.push({
        label: "Step 3",
        expression: `${num1} × ${hundreds2} × 100`,
        result: hundredsProduct,
        note: `Hundreds digit of ${num2} is ${hundreds2} — multiply ${num1} × ${hundreds2} = ${num1 * hundreds2}, then × 100 (shift left 2) = ${hundredsProduct}`,
        color: PURPLE,
        indent: 2,
      });
    }

    // Final addition step
    if (steps.length > 1) {
      const partials = steps.map((s) => s.result);
      const sumExpr = partials.join(" + ");
      steps.push({
        label: `Step ${steps.length + 1}`,
        expression: sumExpr,
        result: answer,
        note: "Add the partial products together to get the final answer",
        color: GREEN,
        indent: 0,
      });
    }

    return {
      steps,
      finalAnswer: answer,
      finalExpression: `${num1} × ${num2} = ${answer}`,
      methodName: "Long Multiplication",
      methodDescription:
        "Break the second number by place value, multiply each part separately, then add the results.",
      num1,
      num2,
      operation: "*",
    };
  }

  // ── ADDITION ─────────────────────────────────────────────────────────────────
  if (normalOp === "+") {
    const answer = num1 + num2;
    const steps: MathMethodStep[] = [];

    const units1 = num1 % 10;
    const units2 = num2 % 10;
    const tens1 = Math.floor(num1 / 10);
    const tens2 = Math.floor(num2 / 10);

    const unitsSum = units1 + units2;
    const carry = unitsSum >= 10 ? 1 : 0;
    const unitsDigit = unitsSum % 10;

    steps.push({
      label: "Step 1",
      expression: `${units1} + ${units2}`,
      result: unitsSum,
      note: `Add the units digits: ${units1} + ${units2} = ${unitsSum}${carry ? ` — write ${unitsDigit}, carry 1` : ""}`,
      color: AMBER,
      indent: 0,
    });

    if (tens1 > 0 || tens2 > 0) {
      const tensSum = tens1 + tens2 + carry;
      const tensResult = tensSum * 10 + unitsDigit;
      if (carry > 0) {
        steps.push({
          label: "Step 2",
          expression: `${tens1} + ${tens2} + 1 (carry)`,
          result: tensSum,
          note: `Add the tens digits plus the carry: ${tens1} + ${tens2} + 1 = ${tensSum}`,
          color: CYAN,
          indent: 0,
        });
      } else {
        steps.push({
          label: "Step 2",
          expression: `${tens1} + ${tens2}`,
          result: tensSum,
          note: `Add the tens digits: ${tens1} + ${tens2} = ${tensSum}`,
          color: CYAN,
          indent: 0,
        });
      }
      steps.push({
        label: "Step 3",
        expression: `${tensSum} tens + ${unitsDigit} units`,
        result: tensResult,
        note: `Combine: ${tensSum} tens and ${unitsDigit} units = ${tensResult}`,
        color: GREEN,
        indent: 0,
      });
    }

    return {
      steps,
      finalAnswer: answer,
      finalExpression: `${num1} + ${num2} = ${answer}`,
      methodName: "Column Addition",
      methodDescription: "Add units first, carry if needed, then add tens.",
      num1,
      num2,
      operation: "+",
    };
  }

  // ── SUBTRACTION ───────────────────────────────────────────────────────────────
  if (normalOp === "-") {
    const answer = num1 - num2;
    const steps: MathMethodStep[] = [];

    const units1 = num1 % 10;
    const units2 = num2 % 10;
    const tens1 = Math.floor(num1 / 10);
    const tens2 = Math.floor(num2 / 10);

    let adjustedUnits1 = units1;
    let adjustedTens1 = tens1;
    let borrowed = false;

    if (units1 < units2) {
      // Need to borrow
      borrowed = true;
      adjustedUnits1 = units1 + 10;
      adjustedTens1 = tens1 - 1;
      steps.push({
        label: "Step 1",
        expression: "Borrow from tens",
        result: adjustedUnits1,
        note: `${units1} is less than ${units2}, so borrow 10 from the tens column. Units becomes ${units1} + 10 = ${adjustedUnits1}`,
        color: ORANGE,
        indent: 0,
      });
    }

    const unitsResult = adjustedUnits1 - units2;
    steps.push({
      label: borrowed ? "Step 2" : "Step 1",
      expression: `${adjustedUnits1} − ${units2}`,
      result: unitsResult,
      note: `Subtract units: ${adjustedUnits1} − ${units2} = ${unitsResult}`,
      color: AMBER,
      indent: 0,
    });

    if (tens1 > 0 || tens2 > 0) {
      const tensResult = adjustedTens1 - tens2;
      const stepLabel = borrowed ? "Step 3" : "Step 2";
      steps.push({
        label: stepLabel,
        expression: borrowed
          ? `${adjustedTens1} − ${tens2} (after borrow)`
          : `${tens1} − ${tens2}`,
        result: tensResult,
        note: `Subtract tens: ${adjustedTens1} − ${tens2} = ${tensResult}`,
        color: CYAN,
        indent: 0,
      });

      const combinedResult = tensResult * 10 + unitsResult;
      steps.push({
        label: `Step ${borrowed ? 4 : 3}`,
        expression: `${tensResult} tens + ${unitsResult} units`,
        result: combinedResult,
        note: `Combine: ${tensResult} tens and ${unitsResult} units = ${combinedResult}`,
        color: GREEN,
        indent: 0,
      });
    }

    return {
      steps,
      finalAnswer: answer,
      finalExpression: `${num1} − ${num2} = ${answer}`,
      methodName: "Column Subtraction",
      methodDescription:
        "Subtract units first, borrow if needed, then subtract tens.",
      num1,
      num2,
      operation: "-",
    };
  }

  // ── DIVISION ───────────────────────────────────────────────────────────────
  const answer = num2 !== 0 ? Math.floor(num1 / num2) : 0;
  const remainder = num2 !== 0 ? num1 % num2 : 0;
  const steps: MathMethodStep[] = [];

  // Count-up method
  const countSteps = Math.min(answer, 6);
  for (let i = 1; i <= countSteps; i++) {
    steps.push({
      label: `Count ${i}`,
      expression: `${num2} × ${i}`,
      result: num2 * i,
      note:
        i === countSteps && i < answer
          ? `…continuing up to ${answer} times`
          : `${num2} fits into ${num2 * i}`,
      color: i % 2 === 0 ? CYAN : AMBER,
      indent: 0,
    });
  }

  steps.push({
    label: "Final Step",
    expression: `${num2} × ${answer} = ${num1 - remainder}`,
    result: answer,
    note:
      remainder === 0
        ? `${num2} fits into ${num1} exactly ${answer} times!`
        : `${num2} fits into ${num1} ${answer} times with ${remainder} left over (remainder)`,
    color: GREEN,
    indent: 0,
  });

  return {
    steps,
    finalAnswer: answer,
    finalExpression: `${num1} ÷ ${num2} = ${answer}${remainder ? ` remainder ${remainder}` : ""}`,
    methodName: "Division by Counting Up",
    methodDescription: `Count how many times ${num2} fits into ${num1}.`,
    num1,
    num2,
    operation: "/",
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

      const method = generateMethodSteps(num1, num2, op);

      return {
        isMath: true,
        expression: `${num1} ${op} ${num2}`,
        answer,
        hint1,
        hint2,
        operation: op,
        method,
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

# Understandify

## Current State
The app is a child-safe learning platform. For math questions, it shows a step-by-step method (MathMethodDisplay component) and then automatically reveals the final answer with confetti after all steps animate in.

## Requested Changes (Diff)

### Add
- After all method steps are shown, display an answer input box where the child types their answer.
- A "Check My Answer" submit button below the input.
- If the child's answer is correct: show a celebratory success message with confetti (same as before).
- If the child's answer is wrong (first attempt): give an encouraging hint and let them try again.
- If the child's answer is wrong a second time: show the correct answer with a kind explanation.

### Modify
- MathMethodDisplay: Remove the automatic final answer reveal. Replace it with the interactive answer input flow described above.

### Remove
- The automatic `setShowFinal` timer that reveals the answer without child input.

## Implementation Plan
1. In `MathMethodDisplay.tsx`, replace the `showFinal` auto-reveal with an `answerPhase` state: `idle` | `awaiting` | `correct` | `hint` | `revealed`.
2. Once all steps have animated in, transition to `awaiting` — show an input field with a "Check My Answer" button.
3. On submit: compare child's input (trimmed) to `mathData.answer`. If correct → `correct` + confetti. If wrong first time → `hint`. If wrong second time → `revealed` (show the actual answer kindly).
4. Keep all existing visual style, confetti, encouragement text, and data-ocid markers.

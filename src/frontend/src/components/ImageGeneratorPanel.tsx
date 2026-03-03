import { Lightbulb, Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

function getAccentColorForPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (
    lower.includes("skeleton") ||
    lower.includes("ghost") ||
    lower.includes("dark")
  )
    return "oklch(0.75 0.18 295)";
  if (
    lower.includes("space") ||
    lower.includes("galaxy") ||
    lower.includes("star")
  )
    return "oklch(0.75 0.20 195)";
  if (
    lower.includes("fire") ||
    lower.includes("dragon") ||
    lower.includes("lava")
  )
    return "oklch(0.82 0.22 45)";
  if (
    lower.includes("forest") ||
    lower.includes("tree") ||
    lower.includes("nature")
  )
    return "oklch(0.72 0.22 145)";
  if (
    lower.includes("ocean") ||
    lower.includes("sea") ||
    lower.includes("water")
  )
    return "oklch(0.72 0.20 210)";
  if (
    lower.includes("sunset") ||
    lower.includes("pink") ||
    lower.includes("flower")
  )
    return "oklch(0.80 0.20 340)";
  if (
    lower.includes("gold") ||
    lower.includes("treasure") ||
    lower.includes("king")
  )
    return "oklch(0.82 0.22 75)";
  return "oklch(0.78 0.20 265)";
}

// Canvas-based "generated image" renderer
function useGeneratedCanvas(prompt: string, seed: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prompt) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Use seed to vary the render
    const rng = (n: number) =>
      Math.sin(seed * 9301 + n * 49297 + 233) * 0.5 + 0.5;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    const lower = prompt.toLowerCase();

    if (
      lower.includes("skeleton") ||
      lower.includes("ghost") ||
      lower.includes("dark")
    ) {
      bg.addColorStop(0, "#1a0530");
      bg.addColorStop(0.5, "#2d0a52");
      bg.addColorStop(1, "#0f0320");
    } else if (
      lower.includes("space") ||
      lower.includes("galaxy") ||
      lower.includes("star")
    ) {
      bg.addColorStop(0, "#050a1f");
      bg.addColorStop(0.5, "#0c1850");
      bg.addColorStop(1, "#020810");
    } else if (lower.includes("fire") || lower.includes("dragon")) {
      bg.addColorStop(0, "#2a0a00");
      bg.addColorStop(0.5, "#5c1500");
      bg.addColorStop(1, "#1a0500");
    } else if (lower.includes("forest") || lower.includes("nature")) {
      bg.addColorStop(0, "#041a08");
      bg.addColorStop(0.5, "#0a2e10");
      bg.addColorStop(1, "#021008");
    } else if (
      lower.includes("ocean") ||
      lower.includes("sea") ||
      lower.includes("water")
    ) {
      bg.addColorStop(0, "#020d28");
      bg.addColorStop(0.5, "#061d4a");
      bg.addColorStop(1, "#010818");
    } else {
      bg.addColorStop(0, "#0d0828");
      bg.addColorStop(0.5, "#1a1050");
      bg.addColorStop(1, "#080520");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Atmospheric orbs
    for (let i = 0; i < 5; i++) {
      const x = rng(i * 10) * W;
      const y = rng(i * 10 + 1) * H;
      const r = 40 + rng(i * 10 + 2) * 120;
      const orb = ctx.createRadialGradient(x, y, 0, x, y, r);

      const hues = [280, 230, 195, 145, 45, 340];
      const hue = hues[Math.floor(rng(i * 10 + 3) * hues.length)];
      orb.addColorStop(0, `hsla(${hue}, 80%, 60%, ${0.15 + rng(i) * 0.2})`);
      orb.addColorStop(1, "hsla(0, 0%, 0%, 0)");
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, W, H);
    }

    // Particle field
    ctx.save();
    for (let i = 0; i < 120; i++) {
      const x = rng(i * 7) * W;
      const y = rng(i * 7 + 1) * H;
      const size = 0.5 + rng(i * 7 + 2) * 2.5;
      const alpha = 0.3 + rng(i * 7 + 3) * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();

    // Abstract shapes
    for (let i = 0; i < 4; i++) {
      const x = rng(i * 13) * W;
      const y = rng(i * 13 + 1) * H;
      const r = 20 + rng(i * 13 + 2) * 80;
      const hue = 180 + rng(i * 13 + 3) * 180;

      ctx.save();
      ctx.globalAlpha = 0.12 + rng(i * 13 + 4) * 0.18;
      ctx.strokeStyle = `hsl(${hue}, 80%, 70%)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // "AI Generated" overlay text at bottom
    ctx.save();
    const overlay = ctx.createLinearGradient(0, H - 60, 0, H);
    overlay.addColorStop(0, "rgba(0,0,0,0)");
    overlay.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, H - 60, W, 60);

    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText("✨ AI Generated", W / 2, H - 12);
    ctx.restore();
  }, [prompt, seed]);

  return canvasRef;
}

const ImageGeneratorPanel: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [seed, setSeed] = useState(1);
  const canvasRef = useGeneratedCanvas(generatedPrompt, seed);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedPrompt("");
    await new Promise((r) => setTimeout(r, 2500));
    setGeneratedPrompt(prompt.trim());
    setSeed((prev) => prev + 1);
    setIsGenerating(false);
  };

  const handleGenerateAgain = async () => {
    if (!generatedPrompt || isGenerating) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setSeed((prev) => prev + 1);
    setIsGenerating(false);
  };

  return (
    <div className="relative z-10 flex flex-col min-h-[calc(100vh-120px)] px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles size={20} style={{ color: "oklch(0.82 0.18 85)" }} />
          <h2
            className="font-fredoka text-2xl font-bold"
            style={{ color: "oklch(0.82 0.18 85)" }}
          >
            AI Image Creator
          </h2>
        </div>
        <p
          className="font-nunito text-sm font-semibold"
          style={{ color: "oklch(0.55 0.05 265)" }}
        >
          Describe anything and watch it come to life ✨ — Free for everyone!
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Prompt input */}
        <div
          className="rounded-2xl"
          style={{
            background: "oklch(0.14 0.05 265)",
            border: "1px solid oklch(0.26 0.07 265)",
          }}
        >
          <textarea
            data-ocid="image_gen.prompt_input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create... e.g. a skeleton wearing a mask in a haunted forest"
            rows={3}
            className="w-full bg-transparent font-nunito text-sm font-medium resize-none outline-none px-4 py-4 leading-relaxed rounded-2xl"
            style={{ color: "oklch(0.88 0.03 265)" }}
          />
          <div className="px-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lightbulb size={12} style={{ color: "oklch(0.82 0.18 85)" }} />
              <span
                className="font-nunito text-xs font-semibold"
                style={{ color: "oklch(0.50 0.05 265)" }}
              >
                💡 Tip: Be specific for better results!
              </span>
            </div>
            <button
              type="button"
              data-ocid="image_gen.generate_button"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-nunito font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  prompt.trim() && !isGenerating
                    ? "oklch(0.82 0.18 85)"
                    : "oklch(0.22 0.06 265)",
                color:
                  prompt.trim() && !isGenerating
                    ? "oklch(0.10 0.04 265)"
                    : "oklch(0.55 0.05 265)",
                boxShadow:
                  prompt.trim() && !isGenerating
                    ? "0 0 15px oklch(0.82 0.18 85 / 0.35)"
                    : "none",
              }}
            >
              {isGenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div
            data-ocid="image_gen.loading_state"
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.14 0.05 265)",
              border: "1px solid oklch(0.26 0.07 265)",
            }}
          >
            <div
              className="w-full animate-gen-pulse rounded-2xl"
              style={{
                height: "280px",
                background:
                  "linear-gradient(135deg, oklch(0.18 0.08 270) 0%, oklch(0.22 0.10 280) 50%, oklch(0.16 0.07 260) 100%)",
              }}
            />
            <div className="px-4 py-4 flex items-center gap-3">
              <Loader2
                size={18}
                className="animate-spin flex-shrink-0"
                style={{ color: "oklch(0.75 0.20 195)" }}
              />
              <div>
                <p
                  className="font-nunito text-sm font-bold"
                  style={{ color: "oklch(0.78 0.05 265)" }}
                >
                  Creating your image...
                </p>
                <p
                  className="font-nunito text-xs font-semibold"
                  style={{ color: "oklch(0.45 0.05 265)" }}
                >
                  AI is working its magic ✨
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generated result */}
        {!isGenerating && generatedPrompt && (
          <div
            data-ocid="image_gen.result"
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.14 0.05 265)",
              border: `1px solid ${getAccentColorForPrompt(generatedPrompt)} `,
              boxShadow: `0 0 25px ${getAccentColorForPrompt(generatedPrompt).replace("oklch(", "oklch(").replace(")", " / 0.2)")}`,
            }}
          >
            {/* Canvas art */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={480}
                height={280}
                className="w-full"
                style={{ display: "block" }}
              />
              {/* Prompt overlay */}
              <div
                className="absolute inset-x-0 top-0 p-3"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)",
                }}
              >
                <p
                  className="font-nunito text-xs font-semibold line-clamp-2"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  "{generatedPrompt}"
                </p>
              </div>
              {/* AI badge */}
              <div
                className="absolute top-2 right-2 px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.82 0.18 85 / 0.9)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span
                  className="font-nunito text-xs font-black"
                  style={{ color: "oklch(0.10 0.04 265)" }}
                >
                  ✨ AI Art
                </span>
              </div>
            </div>

            {/* Generate again */}
            <div className="px-4 py-3 flex items-center justify-between">
              <p
                className="font-nunito text-xs font-semibold"
                style={{ color: "oklch(0.48 0.05 265)" }}
              >
                Not happy? Generate another variation!
              </p>
              <button
                type="button"
                data-ocid="image_gen.generate_again_button"
                onClick={handleGenerateAgain}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-nunito font-bold text-xs transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "oklch(0.20 0.07 265)",
                  border: "1px solid oklch(0.30 0.07 265)",
                  color: "oklch(0.72 0.12 265)",
                }}
              >
                <RefreshCw size={12} />
                Generate Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGeneratorPanel;

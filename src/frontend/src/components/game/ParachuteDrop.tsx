import React, { useEffect, useRef, useState } from "react";

interface ParachuteDropProps {
  onLanded: (landX: number, landZ: number) => void;
}

export default function ParachuteDrop({ onLanded }: ParachuteDropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    x: 400,
    y: -100,
    vx: 0,
    vy: 2,
    landed: false,
    keys: { left: false, right: false, up: false, down: false },
  });
  const animFrameRef = useRef<number>(0);
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState<"countdown" | "dropping">("countdown");

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("dropping");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  useEffect(() => {
    if (phase !== "dropping") return;

    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const k = stateRef.current.keys;
      if (e.key === "a" || e.key === "ArrowLeft") k.left = down;
      if (e.key === "d" || e.key === "ArrowRight") k.right = down;
      if (e.key === "w" || e.key === "ArrowUp") k.up = down;
      if (e.key === "s" || e.key === "ArrowDown") k.down = down;
    };

    window.addEventListener("keydown", (e) => handleKey(e, true));
    window.addEventListener("keyup", (e) => handleKey(e, false));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.src = "/assets/generated/parachute-sprite.dim_128x256.png";

    const groundY = canvas.height - 120;

    const loop = () => {
      const s = stateRef.current;
      if (s.landed) return;

      // Steering
      if (s.keys.left) s.vx = Math.max(s.vx - 0.3, -4);
      else if (s.keys.right) s.vx = Math.min(s.vx + 0.3, 4);
      else s.vx *= 0.92;

      if (s.keys.up) s.vy = Math.max(s.vy - 0.1, 1);
      else if (s.keys.down) s.vy = Math.min(s.vy + 0.1, 5);

      s.x = Math.max(60, Math.min(canvas.width - 60, s.x + s.vx));
      s.y += s.vy;

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#0a0a1a");
      grad.addColorStop(1, "#1a2a1a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.fillStyle = "#1a3a1a";
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.fillStyle = "#2a5a2a";
      ctx.fillRect(0, groundY, canvas.width, 4);

      // Map circle indicator
      ctx.strokeStyle = "rgba(0,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, groundY + 10, 200, 20, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Shadow
      const shadowScale = Math.max(0.2, 1 - (s.y / groundY) * 0.8);
      ctx.fillStyle = `rgba(0,0,0,${0.4 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(
        s.x,
        groundY + 5,
        30 * shadowScale,
        8 * shadowScale,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Parachute sprite
      if (img.complete) {
        ctx.drawImage(img, s.x - 32, s.y - 80, 64, 128);
      } else {
        // Fallback
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.arc(s.x, s.y - 60, 30, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x - 20, s.y - 40);
        ctx.lineTo(s.x, s.y);
        ctx.moveTo(s.x + 20, s.y - 40);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(s.x - 8, s.y - 10, 16, 20);
      }

      // Speed lines
      if (s.vy > 2) {
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const lx = s.x - 40 + i * 20;
          ctx.beginPath();
          ctx.moveTo(lx, s.y - 20);
          ctx.lineTo(lx, s.y - 20 - s.vy * 8);
          ctx.stroke();
        }
      }

      // Check landing
      if (s.y >= groundY) {
        s.landed = true;
        // Convert canvas coords to game world coords
        const worldX = (s.x / canvas.width - 0.5) * 80;
        const worldZ = (s.y / canvas.height - 0.5) * 80;
        onLanded(worldX, worldZ);
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("keydown", (e) => handleKey(e, true));
      window.removeEventListener("keyup", (e) => handleKey(e, false));
    };
  }, [phase, onLanded]);

  return (
    <div className="absolute inset-0 z-30 bg-bz-dark">
      {phase === "countdown" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(/assets/generated/menu-bg.dim_1920x1080.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.3,
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <p className="text-bz-muted text-sm tracking-[0.4em] font-bold">
              PREPARE TO DEPLOY
            </p>
            <div
              className="font-tactical text-9xl font-black text-bz-orange"
              style={{ textShadow: "0 0 40px rgba(255,102,0,0.8)" }}
            >
              {countdown === 0 ? "GO!" : countdown}
            </div>
            <p className="text-bz-muted text-xs tracking-widest">
              USE WASD TO STEER YOUR LANDING
            </p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
        style={{ display: phase === "dropping" ? "block" : "none" }}
      />
      {phase === "dropping" && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bz-hud-panel px-4 py-2 z-40">
          <p className="text-bz-cyan text-sm font-bold tracking-[0.3em]">
            ↑↓ SPEED · ←→ STEER · LAND ON THE MAP
          </p>
        </div>
      )}
    </div>
  );
}

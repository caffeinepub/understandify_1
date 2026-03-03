import { Crosshair, Home, RotateCcw, Skull } from "lucide-react";
import React from "react";

interface GameOverScreenProps {
  kills: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({
  kills,
  onPlayAgain,
  onMenu,
}: GameOverScreenProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center relative overflow-hidden bg-bz-dark">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url(/assets/generated/menu-bg.dim_1920x1080.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(100%) brightness(0.3)",
        }}
      />

      {/* Red vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(255,34,68,0.4) 100%)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-md w-full">
        {/* Icon */}
        <div className="relative">
          <Skull
            className="w-24 h-24 text-bz-red"
            style={{ filter: "drop-shadow(0 0 20px rgba(255,34,68,0.8))" }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="font-tactical text-6xl font-black text-bz-red tracking-widest"
            style={{
              textShadow:
                "0 0 30px rgba(255,34,68,0.8), 0 0 60px rgba(255,34,68,0.4)",
            }}
          >
            GAME OVER
          </h1>
          <p className="text-bz-muted text-sm tracking-[0.4em] mt-2">
            YOU HAVE BEEN ELIMINATED
          </p>
        </div>

        {/* Stats */}
        <div className="bz-card w-full p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-bz-orange" />
            <div className="text-center">
              <div className="font-tactical text-4xl font-black text-bz-orange">
                {kills}
              </div>
              <div className="text-bz-muted text-xs tracking-[0.3em]">
                ENEMIES ELIMINATED
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-bz-border" />
          <p className="text-bz-muted text-xs tracking-widest text-center">
            {kills === 0
              ? "Better luck next time, soldier."
              : kills < 3
                ? "You fought bravely."
                : kills < 5
                  ? "Impressive combat record."
                  : "Outstanding performance!"}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={onPlayAgain}
            className="bz-btn-primary w-full flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            DEPLOY AGAIN
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="bz-btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

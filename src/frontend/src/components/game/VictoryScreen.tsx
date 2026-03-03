import { Crosshair, Home, RotateCcw, Star, Trophy } from "lucide-react";
import React from "react";

interface VictoryScreenProps {
  kills: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function VictoryScreen({
  kills,
  onPlayAgain,
  onMenu,
}: VictoryScreenProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center relative overflow-hidden bg-bz-dark">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/assets/generated/menu-bg.dim_1920x1080.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Cyan/gold vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,255,200,0.1) 0%, transparent 60%)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
        }}
      />

      {/* Floating stars */}
      {[
        "s1",
        "s2",
        "s3",
        "s4",
        "s5",
        "s6",
        "s7",
        "s8",
        "s9",
        "s10",
        "s11",
        "s12",
      ].map((id, i) => (
        <Star
          key={id}
          className="absolute text-yellow-400 animate-pulse"
          style={{
            left: `${10 + ((i * 7.5) % 80)}%`,
            top: `${5 + ((i * 13) % 30)}%`,
            width: `${12 + (i % 3) * 6}px`,
            height: `${12 + (i % 3) * 6}px`,
            opacity: 0.4 + (i % 3) * 0.2,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-md w-full">
        {/* Icon */}
        <div className="relative">
          <Trophy
            className="w-24 h-24 text-yellow-400"
            style={{ filter: "drop-shadow(0 0 25px rgba(255,200,0,0.9))" }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="font-tactical text-6xl font-black text-bz-cyan tracking-widest"
            style={{
              textShadow:
                "0 0 30px rgba(0,255,255,0.8), 0 0 60px rgba(0,255,255,0.4)",
            }}
          >
            VICTORY!
          </h1>
          <p className="text-yellow-400 text-sm tracking-[0.4em] mt-2">
            BATTLE ZONE CHAMPION
          </p>
        </div>

        {/* Stats */}
        <div className="bz-card w-full p-6 flex flex-col items-center gap-4 border-bz-cyan">
          <div className="flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-bz-cyan" />
            <div className="text-center">
              <div className="font-tactical text-4xl font-black text-bz-cyan">
                {kills}
              </div>
              <div className="text-bz-muted text-xs tracking-[0.3em]">
                ENEMIES ELIMINATED
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-bz-border" />
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(kills, 5) }, (_, i) => i).map(
              (i) => (
                <Star
                  key={`kill-star-${i}`}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ),
            )}
          </div>
          <p className="text-bz-cyan text-xs tracking-widest text-center font-bold">
            {kills >= 6
              ? "PERFECT VICTORY — ALL ENEMIES ELIMINATED!"
              : "ZONE VICTORY — LAST SOLDIER STANDING!"}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={onPlayAgain}
            className="bz-btn-cyan w-full flex items-center justify-center gap-2"
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

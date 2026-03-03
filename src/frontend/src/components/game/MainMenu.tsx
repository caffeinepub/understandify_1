import { useQueryClient } from "@tanstack/react-query";
import { Crosshair, LogOut, Play, User } from "lucide-react";
import React from "react";
import type { MatchResult } from "../../BattleZoneApp";
import { useGetCallerUserProfile } from "../../hooks/useBattleZoneQueries";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import LoginPrompt from "./LoginPrompt";
import StatsDisplay from "./StatsDisplay";

interface MainMenuProps {
  onStartGame: () => void;
  lastMatchResult?: MatchResult;
}

function MenuContent({ onStartGame, lastMatchResult }: MainMenuProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url(/assets/generated/menu-bg.dim_1920x1080.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bz-dark/70 via-bz-dark/50 to-bz-dark/90" />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
        <div className="flex items-center gap-2 text-bz-muted text-sm tracking-widest">
          <User className="w-4 h-4 text-bz-cyan" />
          <span className="text-bz-cyan font-bold">
            {userProfile?.name ?? "SOLDIER"}
          </span>
        </div>
        {identity && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-bz-muted hover:text-bz-red transition-colors text-sm tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-lg px-6">
        {/* Logo */}
        <div className="relative">
          <img
            src="/assets/generated/battle-zone-logo.dim_800x200.png"
            alt="Battle Zone"
            className="w-full max-w-sm drop-shadow-[0_0_30px_rgba(255,102,0,0.9)]"
          />
          <div className="absolute inset-0 bg-bz-orange/10 blur-3xl -z-10" />
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-bz-orange/50" />
          <p className="text-bz-muted text-xs tracking-[0.4em] font-bold">
            SURVIVE · ELIMINATE · DOMINATE
          </p>
          <div className="h-px w-16 bg-bz-orange/50" />
        </div>

        {/* Last match result */}
        {lastMatchResult && lastMatchResult.kills > 0 && (
          <div
            className={`bz-card px-6 py-3 flex items-center gap-3 ${lastMatchResult.won ? "border-bz-cyan" : "border-bz-red"}`}
          >
            <Crosshair
              className={`w-5 h-5 ${lastMatchResult.won ? "text-bz-cyan" : "text-bz-red"}`}
            />
            <span className="text-bz-muted text-sm tracking-widest">
              LAST MATCH:{" "}
              <span
                className={`font-bold ${lastMatchResult.won ? "text-bz-cyan" : "text-bz-orange"}`}
              >
                {lastMatchResult.kills} KILLS
              </span>
              {lastMatchResult.won && (
                <span className="text-bz-cyan ml-2">· VICTORY</span>
              )}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="w-full">
          <StatsDisplay />
        </div>

        {/* Play button */}
        <button
          type="button"
          onClick={onStartGame}
          className="bz-btn-primary w-full flex items-center justify-center gap-3 text-xl py-5 group"
        >
          <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
          DEPLOY TO BATTLE
        </button>

        {/* Controls hint */}
        <div className="grid grid-cols-2 gap-2 w-full text-xs text-bz-muted tracking-widest">
          <div className="bz-card-sm p-2 text-center">WASD · MOVE</div>
          <div className="bz-card-sm p-2 text-center">MOUSE · AIM & SHOOT</div>
          <div className="bz-card-sm p-2 text-center">R · RELOAD</div>
          <div className="bz-card-sm p-2 text-center">
            1/2/3 · SWITCH WEAPON
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
        <p className="text-bz-muted/50 text-xs tracking-widest">
          Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-bz-orange/70 hover:text-bz-orange transition-colors"
          >
            caffeine.ai
          </a>{" "}
          · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function MainMenu({
  onStartGame,
  lastMatchResult,
}: MainMenuProps) {
  return (
    <LoginPrompt>
      <MenuContent
        onStartGame={onStartGame}
        lastMatchResult={lastMatchResult}
      />
    </LoginPrompt>
  );
}

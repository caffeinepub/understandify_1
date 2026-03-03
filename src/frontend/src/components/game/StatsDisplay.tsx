import { Crosshair, Gamepad2, Loader2, Trophy } from "lucide-react";
import React from "react";
import { useGetMyPlayerStats } from "../../hooks/useBattleZoneQueries";

export default function StatsDisplay() {
  const { data: stats, isLoading } = useGetMyPlayerStats();

  if (isLoading) {
    return (
      <div className="bz-card p-4 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 text-bz-orange animate-spin" />
        <span className="text-bz-muted text-sm tracking-widest">
          LOADING STATS...
        </span>
      </div>
    );
  }

  const totalKills = stats ? Number(stats.totalKills) : 0;
  const matchesPlayed = stats ? Number(stats.matchesPlayed) : 0;
  const wins = stats ? Number(stats.wins) : 0;
  const winRate =
    matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

  return (
    <div className="bz-card p-4">
      <h3 className="text-bz-muted text-xs tracking-[0.3em] font-bold mb-3 text-center">
        COMBAT RECORD
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1">
          <Crosshair className="w-5 h-5 text-bz-red" />
          <span className="text-bz-orange font-tactical text-2xl font-bold">
            {totalKills}
          </span>
          <span className="text-bz-muted text-xs tracking-widest">KILLS</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Gamepad2 className="w-5 h-5 text-bz-cyan" />
          <span className="text-bz-orange font-tactical text-2xl font-bold">
            {matchesPlayed}
          </span>
          <span className="text-bz-muted text-xs tracking-widest">MATCHES</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-bz-orange font-tactical text-2xl font-bold">
            {wins}
          </span>
          <span className="text-bz-muted text-xs tracking-widest">WINS</span>
        </div>
      </div>
      {matchesPlayed > 0 && (
        <div className="mt-3 pt-3 border-t border-bz-border">
          <div className="flex justify-between items-center text-xs">
            <span className="text-bz-muted tracking-widest">WIN RATE</span>
            <span className="text-bz-cyan font-bold">{winRate}%</span>
          </div>
          <div className="mt-1 h-1.5 bg-bz-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-bz-cyan rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

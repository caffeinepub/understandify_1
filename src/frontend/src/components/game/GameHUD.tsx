import { Clock, Crosshair, Heart, Zap } from "lucide-react";
import React from "react";
import type { Weapon } from "../../lib/weaponSystem";

interface GameHUDProps {
  health: number;
  maxHealth: number;
  kills: number;
  totalEnemies: number;
  currentWeapon: Weapon | null;
  isReloading: boolean;
  reloadProgress: number;
  zoneTimeLeft: number;
  outsideZone: boolean;
}

export default function GameHUD({
  health,
  maxHealth,
  kills,
  totalEnemies,
  currentWeapon,
  isReloading,
  reloadProgress,
  zoneTimeLeft,
  outsideZone,
}: GameHUDProps) {
  const healthPct = Math.max(0, (health / maxHealth) * 100);
  const healthColor =
    healthPct > 60 ? "#00ff88" : healthPct > 30 ? "#ffaa00" : "#ff2244";
  const enemiesLeft = totalEnemies - kills;
  const zoneMinutes = Math.floor(zoneTimeLeft / 60);
  const zoneSecs = Math.floor(zoneTimeLeft % 60);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none">
      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-8 h-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-bz-cyan/80" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-bz-cyan/80" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-2.5 bg-bz-cyan/80" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-2.5 bg-bz-cyan/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-bz-cyan/60" />
          </div>
        </div>
      </div>

      {/* Health bar - bottom left */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: healthColor }} />
          <span
            className="font-tactical text-sm font-bold tracking-widest"
            style={{ color: healthColor }}
          >
            {Math.ceil(health)} / {maxHealth}
          </span>
        </div>
        <div className="h-3 bg-bz-dark/80 border border-bz-border rounded-sm overflow-hidden">
          <div
            className="h-full transition-all duration-200 rounded-sm"
            style={{
              width: `${healthPct}%`,
              backgroundColor: healthColor,
              boxShadow: `0 0 8px ${healthColor}80`,
            }}
          />
        </div>
        {health <= 30 && (
          <div className="text-bz-red text-xs font-bold tracking-[0.3em] animate-pulse">
            ⚠ CRITICAL HEALTH
          </div>
        )}
      </div>

      {/* Weapon & Ammo - bottom right */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
        {currentWeapon && (
          <>
            <div className="text-bz-muted text-xs tracking-[0.3em] font-bold">
              {currentWeapon.name.toUpperCase()}
            </div>
            {isReloading ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-bz-orange text-sm font-bold tracking-widest animate-pulse">
                  RELOADING...
                </span>
                <div className="w-32 h-2 bg-bz-dark/80 border border-bz-border rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-bz-orange rounded-sm transition-all duration-100"
                    style={{ width: `${reloadProgress * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-bz-cyan" />
                <span className="font-tactical text-2xl font-bold text-bz-cyan tracking-widest">
                  {currentWeapon.currentAmmo}
                </span>
                <span className="text-bz-muted text-sm">
                  / {currentWeapon.maxAmmo}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Kill counter - top right */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 bz-hud-panel px-3 py-2">
          <Crosshair className="w-4 h-4 text-bz-red" />
          <span className="font-tactical text-lg font-bold text-bz-orange tracking-widest">
            {kills}
          </span>
          <span className="text-bz-muted text-xs tracking-widest">KILLS</span>
        </div>
        <div className="bz-hud-panel px-3 py-1 text-xs text-bz-muted tracking-widest">
          {enemiesLeft} ENEMIES LEFT
        </div>
      </div>

      {/* Zone timer - top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <div
          className={`bz-hud-panel px-4 py-2 flex items-center gap-2 ${outsideZone ? "border-bz-red animate-pulse" : ""}`}
        >
          <Clock
            className={`w-4 h-4 ${outsideZone ? "text-bz-red" : "text-bz-cyan"}`}
          />
          <span
            className={`font-tactical text-sm font-bold tracking-widest ${outsideZone ? "text-bz-red" : "text-bz-cyan"}`}
          >
            ZONE: {zoneMinutes}:{zoneSecs.toString().padStart(2, "0")}
          </span>
        </div>
        {outsideZone && (
          <div className="text-center text-bz-red text-xs font-bold tracking-[0.3em] mt-1 animate-pulse">
            ⚠ OUTSIDE SAFE ZONE — TAKING DAMAGE
          </div>
        )}
      </div>

      {/* Weapon slots - bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {["1", "2", "3"].map((slot) => (
          <div
            key={slot}
            className="bz-hud-panel px-3 py-1 text-xs text-bz-muted tracking-widest"
          >
            [{slot}]
          </div>
        ))}
      </div>

      {/* Outside zone vignette */}
      {outsideZone && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(255,34,68,0.3) 100%)",
            animation: "pulse 1s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

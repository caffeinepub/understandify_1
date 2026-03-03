import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  useGetMyPlayerStats,
  useUpdatePlayerStats,
} from "../../hooks/useBattleZoneQueries";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  type AABB,
  circleAABBOverlap,
  lineIntersectsAABB,
  resolveAABBCollision,
} from "../../lib/collisionSystem";
import {
  type Weapon,
  type WeaponType,
  canFire,
  createWeapon,
  fireWeapon,
  reloadWeapon,
} from "../../lib/weaponSystem";
import GameHUD from "./GameHUD";
import ParachuteDrop from "./ParachuteDrop";

interface Game3DProps {
  onGameOver: (kills: number) => void;
  onVictory: (kills: number) => void;
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Vec2 {
  x: number;
  z: number;
}

interface Enemy {
  id: number;
  pos: Vec2;
  health: number;
  maxHealth: number;
  angle: number;
  lastFireTime: number;
  state: "patrol" | "chase" | "attack";
  patrolTarget: Vec2;
  hitFlash: number;
}

interface Bullet {
  id: number;
  pos: Vec2;
  vel: Vec2;
  damage: number;
  fromPlayer: boolean;
  color: string;
  life: number;
}

interface Pickup {
  id: number;
  pos: Vec2;
  weaponType: WeaponType;
  collected: boolean;
}

interface Particle {
  id: number;
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// ── Map obstacles ──────────────────────────────────────────────────────────
const OBSTACLES: AABB[] = [
  { x: -20, z: -20, width: 8, depth: 3 },
  { x: 20, z: -20, width: 8, depth: 3 },
  { x: -20, z: 20, width: 3, depth: 8 },
  { x: 20, z: 20, width: 3, depth: 8 },
  { x: 0, z: -30, width: 6, depth: 6 },
  { x: 0, z: 30, width: 6, depth: 6 },
  { x: -35, z: 0, width: 3, depth: 12 },
  { x: 35, z: 0, width: 3, depth: 12 },
  { x: -10, z: 10, width: 4, depth: 4 },
  { x: 10, z: -10, width: 4, depth: 4 },
  { x: -25, z: -10, width: 5, depth: 3 },
  { x: 25, z: 10, width: 5, depth: 3 },
  { x: 15, z: 25, width: 3, depth: 5 },
  { x: -15, z: -25, width: 3, depth: 5 },
];

const INITIAL_PICKUPS: Pickup[] = [
  {
    id: 1,
    pos: { x: -15, z: -15 },
    weaponType: "assault_rifle",
    collected: false,
  },
  { id: 2, pos: { x: 15, z: 15 }, weaponType: "sniper", collected: false },
  {
    id: 3,
    pos: { x: 25, z: -25 },
    weaponType: "assault_rifle",
    collected: false,
  },
  { id: 4, pos: { x: -25, z: 25 }, weaponType: "pistol", collected: false },
];

const INITIAL_ENEMIES: Omit<Enemy, "id">[] = [
  {
    pos: { x: -30, z: -30 },
    health: 100,
    maxHealth: 100,
    angle: 0,
    lastFireTime: 0,
    state: "patrol",
    patrolTarget: { x: -20, z: -20 },
    hitFlash: 0,
  },
  {
    pos: { x: 30, z: -30 },
    health: 100,
    maxHealth: 100,
    angle: 0,
    lastFireTime: 0,
    state: "patrol",
    patrolTarget: { x: 20, z: -20 },
    hitFlash: 0,
  },
  {
    pos: { x: -30, z: 30 },
    health: 100,
    maxHealth: 100,
    angle: 0,
    lastFireTime: 0,
    state: "patrol",
    patrolTarget: { x: -20, z: 20 },
    hitFlash: 0,
  },
  {
    pos: { x: 30, z: 30 },
    health: 100,
    maxHealth: 100,
    angle: 0,
    lastFireTime: 0,
    state: "patrol",
    patrolTarget: { x: 20, z: 20 },
    hitFlash: 0,
  },
  {
    pos: { x: 0, z: -40 },
    health: 120,
    maxHealth: 120,
    angle: 0,
    lastFireTime: 0,
    state: "patrol",
    patrolTarget: { x: 5, z: -35 },
    hitFlash: 0,
  },
  {
    pos: { x: 0, z: 40 },
    health: 120,
    maxHealth: 120,
    angle: 0,
    lastFireTime: 0,
    state: "patrol",
    patrolTarget: { x: -5, z: 35 },
    hitFlash: 0,
  },
];

const MAP_SIZE = 100;
const PLAYER_RADIUS = 0.8;
const ENEMY_RADIUS = 0.8;
const BULLET_RADIUS = 0.3;
const ENEMY_DETECT_RANGE = 25;
const ENEMY_ATTACK_RANGE = 20;
const ENEMY_FIRE_RATE = 1.2;
const ENEMY_DAMAGE = 8;
const ZONE_DAMAGE_PER_SEC = 5;
const ZONE_SHRINK_DURATION = 120; // seconds

let bulletIdCounter = 0;
let particleIdCounter = 0;

export default function Game3D({ onGameOver, onVictory }: Game3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { identity } = useInternetIdentity();
  const { data: existingStats } = useGetMyPlayerStats();
  const updateStats = useUpdatePlayerStats();

  // Game state refs (mutable, no re-render needed)
  const gameRef = useRef({
    playerPos: { x: 0, z: 0 } as Vec2,
    playerAngle: 0,
    playerHealth: 100,
    playerMaxHealth: 100,
    kills: 0,
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    pickups: [...INITIAL_PICKUPS] as Pickup[],
    particles: [] as Particle[],
    weapons: [createWeapon("pistol")] as Weapon[],
    currentWeaponIdx: 0,
    lastFireTime: 0,
    isReloading: false,
    reloadStartTime: 0,
    reloadProgress: 0,
    zoneRadius: MAP_SIZE * 0.7,
    zoneCenter: { x: 0, z: 0 } as Vec2,
    zoneTimeLeft: ZONE_SHRINK_DURATION,
    zoneStartTime: 0,
    outsideZone: false,
    keys: {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false,
    },
    mouseX: 0,
    mouseY: 0,
    gameOver: false,
    victory: false,
    lastTime: 0,
    statsUpdated: false,
  });

  // React state for HUD (updated periodically)
  const [hudState, setHudState] = useState({
    health: 100,
    kills: 0,
    totalEnemies: INITIAL_ENEMIES.length,
    currentWeapon: createWeapon("pistol") as Weapon | null,
    isReloading: false,
    reloadProgress: 0,
    zoneTimeLeft: ZONE_SHRINK_DURATION,
    outsideZone: false,
  });

  const [dropPhase, setDropPhase] = useState(true);
  const animFrameRef = useRef<number>(0);
  const hudUpdateRef = useRef<number>(0);

  // Initialize enemies
  useEffect(() => {
    gameRef.current.enemies = INITIAL_ENEMIES.map((e, i) => ({
      ...e,
      id: i + 1,
    }));
    gameRef.current.zoneStartTime = performance.now();
  }, []);

  const handleLanded = useCallback((landX: number, landZ: number) => {
    gameRef.current.playerPos = { x: landX, z: landZ };
    setDropPhase(false);
  }, []);

  // Save stats at end of match
  const saveStats = useCallback(
    async (kills: number, won: boolean) => {
      if (!identity || gameRef.current.statsUpdated) return;
      gameRef.current.statsUpdated = true;
      const prev = existingStats;
      const newStats = {
        totalKills: BigInt((prev ? Number(prev.totalKills) : 0) + kills),
        matchesPlayed: BigInt((prev ? Number(prev.matchesPlayed) : 0) + 1),
        wins: BigInt((prev ? Number(prev.wins) : 0) + (won ? 1 : 0)),
      };
      try {
        await updateStats.mutateAsync(newStats);
      } catch {
        // silently fail
      }
    },
    [identity, existingStats, updateStats],
  );

  // Input handlers
  useEffect(() => {
    if (dropPhase) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key in g.keys) (g.keys as Record<string, boolean>)[e.key] = true;

      // Weapon switch
      if (e.key === "1" && g.weapons[0]) g.currentWeaponIdx = 0;
      if (e.key === "2" && g.weapons[1]) g.currentWeaponIdx = 1;
      if (e.key === "3" && g.weapons[2]) g.currentWeaponIdx = 2;

      // Reload
      if (e.key === "r" || e.key === "R") {
        const w = g.weapons[g.currentWeaponIdx];
        if (w && !g.isReloading && w.currentAmmo < w.maxAmmo) {
          g.isReloading = true;
          g.reloadStartTime = performance.now();
        }
      }
      e.preventDefault();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key in g.keys) (g.keys as Record<string, boolean>)[e.key] = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      gameRef.current.mouseX = e.clientX;
      gameRef.current.mouseY = e.clientY;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) tryFire();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [dropPhase]);

  const tryFire = useCallback(() => {
    const g = gameRef.current;
    if (g.isReloading || g.gameOver || g.victory) return;
    const w = g.weapons[g.currentWeaponIdx];
    if (!w) return;
    const now = performance.now();
    if (!canFire(w, g.lastFireTime, now)) return;

    g.weapons[g.currentWeaponIdx] = fireWeapon(w);
    g.lastFireTime = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const screenX = g.playerPos.x * scale + cx;
    const screenY = g.playerPos.z * scale + cy;
    const dx = g.mouseX - screenX;
    const dy = g.mouseY - screenY;
    const _len = Math.sqrt(dx * dx + dy * dy) || 1;
    const spread = (Math.random() - 0.5) * w.spread;
    const angle = Math.atan2(dy, dx) + spread;

    const speed = w.bulletSpeed / 60;
    g.bullets.push({
      id: ++bulletIdCounter,
      pos: { x: g.playerPos.x, z: g.playerPos.z },
      vel: { x: Math.cos(angle) * speed, z: Math.sin(angle) * speed },
      damage: w.damage,
      fromPlayer: true,
      color: w.bulletColor,
      life: 120,
    });

    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
      const pa = angle + (Math.random() - 0.5) * 0.5;
      const ps = Math.random() * 0.3 + 0.1;
      g.particles.push({
        id: ++particleIdCounter,
        pos: { x: g.playerPos.x, z: g.playerPos.z },
        vel: { x: Math.cos(pa) * ps, z: Math.sin(pa) * ps },
        life: 8,
        maxLife: 8,
        color: w.bulletColor,
        size: Math.random() * 3 + 1,
      });
    }

    if (w.currentAmmo === 0) {
      g.isReloading = true;
      g.reloadStartTime = now;
    }
  }, []);

  // Main game loop
  useEffect(() => {
    if (dropPhase) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const SPEED = 0.12;

    const loop = (timestamp: number) => {
      const g = gameRef.current;
      const dt = Math.min((timestamp - (g.lastTime || timestamp)) / 16.67, 3);
      g.lastTime = timestamp;

      if (g.gameOver || g.victory) return;

      const scale = Math.min(canvas.width, canvas.height) / MAP_SIZE;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // ── Player movement ──────────────────────────────────────────────────
      let dx = 0;
      let dz = 0;
      if (g.keys.w || g.keys.ArrowUp) dz -= 1;
      if (g.keys.s || g.keys.ArrowDown) dz += 1;
      if (g.keys.a || g.keys.ArrowLeft) dx -= 1;
      if (g.keys.d || g.keys.ArrowRight) dx += 1;
      const dlen = Math.sqrt(dx * dx + dz * dz) || 1;
      if (dx !== 0 || dz !== 0) {
        let nx = g.playerPos.x + (dx / dlen) * SPEED * dt;
        let nz = g.playerPos.z + (dz / dlen) * SPEED * dt;
        nx = Math.max(-MAP_SIZE / 2 + 1, Math.min(MAP_SIZE / 2 - 1, nx));
        nz = Math.max(-MAP_SIZE / 2 + 1, Math.min(MAP_SIZE / 2 - 1, nz));
        let resolved = { x: nx, z: nz };
        for (const obs of OBSTACLES) {
          resolved = resolveAABBCollision(resolved, PLAYER_RADIUS, obs);
        }
        g.playerPos = resolved;
      }

      // Player angle toward mouse
      const screenX = g.playerPos.x * scale + cx;
      const screenY = g.playerPos.z * scale + cy;
      g.playerAngle = Math.atan2(g.mouseY - screenY, g.mouseX - screenX);

      // ── Reload ───────────────────────────────────────────────────────────
      if (g.isReloading) {
        const w = g.weapons[g.currentWeaponIdx];
        if (w) {
          const elapsed = (timestamp - g.reloadStartTime) / 1000;
          g.reloadProgress = Math.min(elapsed / w.reloadTime, 1);
          if (g.reloadProgress >= 1) {
            g.weapons[g.currentWeaponIdx] = reloadWeapon(w);
            g.isReloading = false;
            g.reloadProgress = 0;
          }
        }
      }

      // ── Zone ─────────────────────────────────────────────────────────────
      const zoneElapsed = (timestamp - g.zoneStartTime) / 1000;
      g.zoneTimeLeft = Math.max(0, ZONE_SHRINK_DURATION - zoneElapsed);
      const zoneProgress = zoneElapsed / ZONE_SHRINK_DURATION;
      g.zoneRadius = MAP_SIZE * 0.7 * Math.max(0.05, 1 - zoneProgress * 0.95);

      const distToCenter = Math.sqrt(
        (g.playerPos.x - g.zoneCenter.x) ** 2 +
          (g.playerPos.z - g.zoneCenter.z) ** 2,
      );
      g.outsideZone = distToCenter > g.zoneRadius;
      if (g.outsideZone) {
        g.playerHealth -= ZONE_DAMAGE_PER_SEC * (dt / 60);
      }

      // ── Weapon pickups ───────────────────────────────────────────────────
      for (const pickup of g.pickups) {
        if (pickup.collected) continue;
        const pdx = g.playerPos.x - pickup.pos.x;
        const pdz = g.playerPos.z - pickup.pos.z;
        if (Math.sqrt(pdx * pdx + pdz * pdz) < 2) {
          pickup.collected = true;
          const newWeapon = createWeapon(pickup.weaponType);
          const existing = g.weapons.findIndex(
            (w) => w.type === pickup.weaponType,
          );
          if (existing >= 0) {
            g.weapons[existing] = newWeapon;
          } else if (g.weapons.length < 3) {
            g.weapons.push(newWeapon);
          } else {
            g.weapons[g.currentWeaponIdx] = newWeapon;
          }
        }
      }

      // ── Enemy AI ─────────────────────────────────────────────────────────
      for (const enemy of g.enemies) {
        if (enemy.health <= 0) continue;
        if (enemy.hitFlash > 0) enemy.hitFlash -= dt;

        const edx = g.playerPos.x - enemy.pos.x;
        const edz = g.playerPos.z - enemy.pos.z;
        const distToPlayer = Math.sqrt(edx * edx + edz * edz);

        if (distToPlayer < ENEMY_DETECT_RANGE) {
          enemy.state = distToPlayer < ENEMY_ATTACK_RANGE ? "attack" : "chase";
        } else {
          enemy.state = "patrol";
        }

        if (enemy.state === "chase" || enemy.state === "attack") {
          enemy.angle = Math.atan2(edz, edx);
          if (enemy.state === "chase") {
            const espeed = 0.06 * dt;
            let nx = enemy.pos.x + Math.cos(enemy.angle) * espeed;
            let nz = enemy.pos.z + Math.sin(enemy.angle) * espeed;
            let resolved = { x: nx, z: nz };
            for (const obs of OBSTACLES) {
              resolved = resolveAABBCollision(resolved, ENEMY_RADIUS, obs);
            }
            enemy.pos = resolved;
          }

          // Enemy shooting
          if (enemy.state === "attack") {
            const now = timestamp;
            const fireCooldown = 1000 / ENEMY_FIRE_RATE;
            if (now - enemy.lastFireTime > fireCooldown) {
              // Check line of sight
              let hasLOS = true;
              for (const obs of OBSTACLES) {
                if (
                  lineIntersectsAABB(
                    enemy.pos.x,
                    enemy.pos.z,
                    g.playerPos.x,
                    g.playerPos.z,
                    obs,
                  )
                ) {
                  hasLOS = false;
                  break;
                }
              }
              if (hasLOS) {
                enemy.lastFireTime = now;
                const spread = (Math.random() - 0.5) * 0.15;
                const bangle = enemy.angle + spread;
                const bspeed = 0.25;
                g.bullets.push({
                  id: ++bulletIdCounter,
                  pos: { x: enemy.pos.x, z: enemy.pos.z },
                  vel: {
                    x: Math.cos(bangle) * bspeed,
                    z: Math.sin(bangle) * bspeed,
                  },
                  damage: ENEMY_DAMAGE,
                  fromPlayer: false,
                  color: "#ff2244",
                  life: 80,
                });
              }
            }
          }
        } else {
          // Patrol
          const ptdx = enemy.patrolTarget.x - enemy.pos.x;
          const ptdz = enemy.patrolTarget.z - enemy.pos.z;
          const ptdist = Math.sqrt(ptdx * ptdx + ptdz * ptdz);
          if (ptdist < 1) {
            enemy.patrolTarget = {
              x: (Math.random() - 0.5) * 40,
              z: (Math.random() - 0.5) * 40,
            };
          } else {
            const pangle = Math.atan2(ptdz, ptdx);
            enemy.angle = pangle;
            const espeed = 0.03 * dt;
            let nx = enemy.pos.x + Math.cos(pangle) * espeed;
            let nz = enemy.pos.z + Math.sin(pangle) * espeed;
            let resolved = { x: nx, z: nz };
            for (const obs of OBSTACLES) {
              resolved = resolveAABBCollision(resolved, ENEMY_RADIUS, obs);
            }
            enemy.pos = resolved;
          }
        }
      }

      // ── Bullets ──────────────────────────────────────────────────────────
      g.bullets = g.bullets.filter((b) => {
        b.pos.x += b.vel.x * dt;
        b.pos.z += b.vel.z * dt;
        b.life -= dt;
        if (b.life <= 0) return false;

        // Obstacle collision
        for (const obs of OBSTACLES) {
          if (
            circleAABBOverlap(
              { x: b.pos.x, z: b.pos.z, radius: BULLET_RADIUS },
              obs,
            )
          ) {
            // Spark particles
            for (let i = 0; i < 4; i++) {
              const pa = Math.random() * Math.PI * 2;
              g.particles.push({
                id: ++particleIdCounter,
                pos: { ...b.pos },
                vel: { x: Math.cos(pa) * 0.1, z: Math.sin(pa) * 0.1 },
                life: 10,
                maxLife: 10,
                color: "#ffaa00",
                size: 2,
              });
            }
            return false;
          }
        }

        // Player hit
        if (!b.fromPlayer) {
          const pdx = b.pos.x - g.playerPos.x;
          const pdz = b.pos.z - g.playerPos.z;
          if (
            Math.sqrt(pdx * pdx + pdz * pdz) <
            PLAYER_RADIUS + BULLET_RADIUS
          ) {
            g.playerHealth -= b.damage;
            // Hit particles
            for (let i = 0; i < 6; i++) {
              const pa = Math.random() * Math.PI * 2;
              g.particles.push({
                id: ++particleIdCounter,
                pos: { ...b.pos },
                vel: { x: Math.cos(pa) * 0.15, z: Math.sin(pa) * 0.15 },
                life: 12,
                maxLife: 12,
                color: "#ff2244",
                size: 3,
              });
            }
            return false;
          }
        }

        // Enemy hit
        if (b.fromPlayer) {
          for (const enemy of g.enemies) {
            if (enemy.health <= 0) continue;
            const edx = b.pos.x - enemy.pos.x;
            const edz = b.pos.z - enemy.pos.z;
            if (
              Math.sqrt(edx * edx + edz * edz) <
              ENEMY_RADIUS + BULLET_RADIUS
            ) {
              enemy.health -= b.damage;
              enemy.hitFlash = 8;
              // Hit particles
              for (let i = 0; i < 8; i++) {
                const pa = Math.random() * Math.PI * 2;
                g.particles.push({
                  id: ++particleIdCounter,
                  pos: { ...b.pos },
                  vel: { x: Math.cos(pa) * 0.2, z: Math.sin(pa) * 0.2 },
                  life: 15,
                  maxLife: 15,
                  color: i % 2 === 0 ? "#ff6600" : "#ff2244",
                  size: Math.random() * 4 + 2,
                });
              }
              if (enemy.health <= 0) {
                g.kills++;
                // Explosion
                for (let i = 0; i < 20; i++) {
                  const pa = Math.random() * Math.PI * 2;
                  const ps = Math.random() * 0.3 + 0.05;
                  g.particles.push({
                    id: ++particleIdCounter,
                    pos: { ...enemy.pos },
                    vel: { x: Math.cos(pa) * ps, z: Math.sin(pa) * ps },
                    life: 30,
                    maxLife: 30,
                    color: ["#ff6600", "#ff2244", "#ffcc00", "#ff8800"][
                      Math.floor(Math.random() * 4)
                    ],
                    size: Math.random() * 6 + 2,
                  });
                }
              }
              return false;
            }
          }
        }

        return true;
      });

      // ── Particles ────────────────────────────────────────────────────────
      g.particles = g.particles.filter((p) => {
        p.pos.x += p.vel.x * dt;
        p.pos.z += p.vel.z * dt;
        p.vel.x *= 0.92;
        p.vel.z *= 0.92;
        p.life -= dt;
        return p.life > 0;
      });

      // ── Check game over / victory ────────────────────────────────────────
      if (g.playerHealth <= 0) {
        g.playerHealth = 0;
        g.gameOver = true;
        saveStats(g.kills, false);
        setTimeout(() => onGameOver(g.kills), 500);
        return;
      }

      const aliveEnemies = g.enemies.filter((e) => e.health > 0);
      if (aliveEnemies.length === 0) {
        g.victory = true;
        saveStats(g.kills, true);
        setTimeout(() => onVictory(g.kills), 500);
        return;
      }

      // ── Render ───────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#0d1a0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(0,80,0,0.3)";
      ctx.lineWidth = 0.5;
      const gridSize = 5 * scale;
      const offsetX = cx % gridSize;
      const offsetY = cy % gridSize;
      for (let gx = offsetX; gx < canvas.width; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, canvas.height);
        ctx.stroke();
      }
      for (let gy = offsetY; gy < canvas.height; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(canvas.width, gy);
        ctx.stroke();
      }

      // Map boundary
      ctx.strokeStyle = "rgba(0,255,100,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        cx - (MAP_SIZE / 2) * scale,
        cy - (MAP_SIZE / 2) * scale,
        MAP_SIZE * scale,
        MAP_SIZE * scale,
      );

      // Safe zone circle
      const zoneScreenRadius = g.zoneRadius * scale;
      const zoneCx = g.zoneCenter.x * scale + cx;
      const zoneCy = g.zoneCenter.z * scale + cy;

      // Zone fill (outside = danger)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.arc(zoneCx, zoneCy, zoneScreenRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = "rgba(0,100,255,0.08)";
      ctx.fill();
      ctx.restore();

      // Zone border
      ctx.strokeStyle = g.outsideZone
        ? "rgba(0,100,255,0.9)"
        : "rgba(0,150,255,0.6)";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(zoneCx, zoneCy, zoneScreenRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Obstacles
      for (const obs of OBSTACLES) {
        const ox = obs.x * scale + cx;
        const oz = obs.z * scale + cy;
        const ow = obs.width * scale;
        const od = obs.depth * scale;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(ox - ow / 2 + 3, oz - od / 2 + 3, ow, od);

        // Wall
        const wallGrad = ctx.createLinearGradient(
          ox - ow / 2,
          oz - od / 2,
          ox + ow / 2,
          oz + od / 2,
        );
        wallGrad.addColorStop(0, "#3a4a3a");
        wallGrad.addColorStop(1, "#2a3a2a");
        ctx.fillStyle = wallGrad;
        ctx.fillRect(ox - ow / 2, oz - od / 2, ow, od);

        ctx.strokeStyle = "#4a6a4a";
        ctx.lineWidth = 1;
        ctx.strokeRect(ox - ow / 2, oz - od / 2, ow, od);
      }

      // Weapon pickups
      for (const pickup of g.pickups) {
        if (pickup.collected) continue;
        const px = pickup.pos.x * scale + cx;
        const pz = pickup.pos.z * scale + cy;
        const pulse = Math.sin(timestamp / 400) * 0.3 + 0.7;

        ctx.save();
        ctx.translate(px, pz);
        ctx.rotate(timestamp / 1000);

        const pickupColor =
          pickup.weaponType === "pistol"
            ? "#ffcc00"
            : pickup.weaponType === "assault_rifle"
              ? "#ff6600"
              : "#00ffff";

        ctx.shadowColor = pickupColor;
        ctx.shadowBlur = 15 * pulse;
        ctx.fillStyle = pickupColor;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(6, 4);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Label
        ctx.fillStyle = pickupColor;
        ctx.font = `bold ${Math.max(8, scale * 0.8)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(
          pickup.weaponType === "pistol"
            ? "PISTOL"
            : pickup.weaponType === "assault_rifle"
              ? "AR"
              : "SNIPER",
          px,
          pz + 18,
        );
      }

      // Particles
      for (const p of g.particles) {
        const alpha = p.life / p.maxLife;
        const px = p.pos.x * scale + cx;
        const pz = p.pos.z * scale + cy;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, pz, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Bullets
      for (const b of g.bullets) {
        const bx = b.pos.x * scale + cx;
        const bz = b.pos.z * scale + cy;
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bx, bz, 3, 0, Math.PI * 2);
        ctx.fill();

        // Bullet trail
        ctx.strokeStyle = `${b.color}60`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, bz);
        ctx.lineTo(bx - b.vel.x * scale * 5, bz - b.vel.z * scale * 5);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Enemies
      for (const enemy of g.enemies) {
        if (enemy.health <= 0) continue;
        const ex = enemy.pos.x * scale + cx;
        const ez = enemy.pos.z * scale + cy;
        const er = ENEMY_RADIUS * scale;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(ex + 2, ez + 2, er, er * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        const flashColor =
          enemy.hitFlash > 0
            ? "#ffffff"
            : enemy.state === "attack"
              ? "#ff2244"
              : "#cc3300";
        ctx.fillStyle = flashColor;
        ctx.shadowColor = enemy.state === "attack" ? "#ff2244" : "#cc3300";
        ctx.shadowBlur = enemy.state === "attack" ? 12 : 4;
        ctx.beginPath();
        ctx.arc(ex, ez, er, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator
        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(ex, ez);
        ctx.lineTo(
          ex + Math.cos(enemy.angle) * er * 1.5,
          ez + Math.sin(enemy.angle) * er * 1.5,
        );
        ctx.stroke();

        // Health bar
        const hpPct = enemy.health / enemy.maxHealth;
        const barW = er * 2.5;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(ex - barW / 2, ez - er - 8, barW, 4);
        ctx.fillStyle =
          hpPct > 0.5 ? "#00ff88" : hpPct > 0.25 ? "#ffaa00" : "#ff2244";
        ctx.fillRect(ex - barW / 2, ez - er - 8, barW * hpPct, 4);
      }
      ctx.shadowBlur = 0;

      // Player
      const px = g.playerPos.x * scale + cx;
      const pz = g.playerPos.z * scale + cy;
      const pr = PLAYER_RADIUS * scale;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(px + 2, pz + 2, pr, pr * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player body
      ctx.fillStyle = "#00ff88";
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(px, pz, pr, 0, Math.PI * 2);
      ctx.fill();

      // Player direction
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, pz);
      ctx.lineTo(
        px + Math.cos(g.playerAngle) * pr * 2,
        pz + Math.sin(g.playerAngle) * pr * 2,
      );
      ctx.stroke();
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    // HUD update interval
    hudUpdateRef.current = window.setInterval(() => {
      const g = gameRef.current;
      setHudState({
        health: g.playerHealth,
        kills: g.kills,
        totalEnemies: INITIAL_ENEMIES.length,
        currentWeapon: g.weapons[g.currentWeaponIdx] ?? null,
        isReloading: g.isReloading,
        reloadProgress: g.reloadProgress,
        zoneTimeLeft: g.zoneTimeLeft,
        outsideZone: g.outsideZone,
      });
    }, 100);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(hudUpdateRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [dropPhase, onGameOver, onVictory, saveStats]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-bz-dark cursor-crosshair">
      {dropPhase && <ParachuteDrop onLanded={handleLanded} />}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: dropPhase ? "none" : "block" }}
      />
      {!dropPhase && (
        <GameHUD
          health={hudState.health}
          maxHealth={100}
          kills={hudState.kills}
          totalEnemies={hudState.totalEnemies}
          currentWeapon={hudState.currentWeapon}
          isReloading={hudState.isReloading}
          reloadProgress={hudState.reloadProgress}
          zoneTimeLeft={hudState.zoneTimeLeft}
          outsideZone={hudState.outsideZone}
        />
      )}
    </div>
  );
}

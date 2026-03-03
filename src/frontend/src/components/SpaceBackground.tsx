import type React from "react";
import { useMemo } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface Planet {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const SpaceBackground: React.FC = () => {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 1.5,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  const planets = useMemo<Planet[]>(
    () => [
      { id: 1, x: 8, y: 15, size: 40, color: "oklch(0.72 0.22 310)", delay: 0 },
      { id: 2, x: 88, y: 25, size: 28, color: "oklch(0.78 0.20 45)", delay: 1 },
      { id: 3, x: 5, y: 75, size: 22, color: "oklch(0.75 0.20 195)", delay: 2 },
      {
        id: 4,
        x: 92,
        y: 70,
        size: 35,
        color: "oklch(0.72 0.22 340)",
        delay: 0.5,
      },
      {
        id: 5,
        x: 50,
        y: 5,
        size: 18,
        color: "oklch(0.82 0.18 85)",
        delay: 1.5,
      },
    ],
    [],
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, oklch(0.15 0.08 280) 0%, oklch(0.10 0.04 265) 50%, oklch(0.08 0.03 250) 100%)",
        }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: "oklch(0.95 0.02 265)",
              opacity: star.opacity,
              "--duration": `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Planets */}
      {planets.map((planet) => (
        <div
          key={planet.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            background: `radial-gradient(circle at 35% 35%, oklch(from ${planet.color} calc(l + 0.15) c h), ${planet.color})`,
            boxShadow: `0 0 ${planet.size / 2}px ${planet.color}80`,
            animationDelay: `${planet.delay}s`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Orbit rings */}
      <div
        className="absolute rounded-full border opacity-10"
        style={{
          width: "200px",
          height: "200px",
          left: "5%",
          top: "10%",
          borderColor: "oklch(0.75 0.20 195)",
          transform: "rotate(-30deg)",
        }}
      />
      <div
        className="absolute rounded-full border opacity-10"
        style={{
          width: "150px",
          height: "150px",
          right: "5%",
          bottom: "15%",
          borderColor: "oklch(0.82 0.18 85)",
          transform: "rotate(20deg)",
        }}
      />

      {/* Nebula glow */}
      <div
        className="absolute rounded-full opacity-5"
        style={{
          width: "400px",
          height: "400px",
          right: "-100px",
          top: "-100px",
          background:
            "radial-gradient(circle, oklch(0.72 0.22 310) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full opacity-5"
        style={{
          width: "300px",
          height: "300px",
          left: "-80px",
          bottom: "-80px",
          background:
            "radial-gradient(circle, oklch(0.75 0.20 195) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default SpaceBackground;

import type React from "react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDismiss: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDismiss, 600);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.15 0.08 280) 0%, oklch(0.08 0.03 250) 100%)",
        transition: "opacity 0.6s ease-out",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* Animated stars */}
      {Array.from({ length: 40 }, (_, i) => `star-${i}`).map((id) => (
        <div
          key={id}
          className="absolute rounded-full animate-twinkle"
          style={
            {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: "oklch(0.95 0.02 265)",
              "--duration": `${Math.random() * 2 + 1}s`,
              animationDelay: `${Math.random() * 3}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Logo */}
      <div className="animate-bounce-in flex flex-col items-center gap-6">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{
              background:
                "radial-gradient(circle, oklch(0.82 0.18 85 / 0.3) 0%, transparent 70%)",
              transform: "scale(1.3)",
            }}
          />
          <img
            src="/assets/generated/understandify-logo.dim_512x512.png"
            alt="Understandify Logo"
            className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 20px oklch(0.82 0.18 85 / 0.6))",
            }}
          />
        </div>

        <div className="text-center">
          <h1
            className="font-fredoka text-5xl md:text-6xl font-bold text-glow-yellow"
            style={{ color: "oklch(0.82 0.18 85)" }}
          >
            Understandify
          </h1>
          <p
            className="font-nunito text-lg mt-2 font-semibold"
            style={{ color: "oklch(0.75 0.20 195)" }}
          >
            🚀 Explore. Learn. Discover! ✨
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-bounce"
              style={{
                backgroundColor: "oklch(0.82 0.18 85)",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setFadeOut(true);
            setTimeout(onDismiss, 600);
          }}
          className="font-nunito text-sm mt-2 opacity-60 bg-transparent border-none cursor-pointer"
          style={{ color: "oklch(0.75 0.05 265)" }}
        >
          Tap to continue
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;

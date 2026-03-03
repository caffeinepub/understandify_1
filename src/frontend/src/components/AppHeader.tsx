import { LogOut, MoreVertical } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface AppHeaderProps {
  mode: "child" | "parent";
  onParentClick?: () => void;
  onExitParent?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  mode,
  onParentClick,
  onExitParent,
}) => {
  const [dotsOpen, setDotsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDotsOpen(false);
      }
    };
    if (dotsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dotsOpen]);

  return (
    <header
      className="relative z-10 flex items-center justify-between px-4 py-3"
      style={{
        background: "oklch(0.12 0.05 265 / 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(0.28 0.07 265)",
        boxShadow: "0 2px 20px oklch(0.08 0.03 250 / 0.8)",
      }}
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.82 0.18 85 / 0.2) 0%, transparent 70%)",
              transform: "scale(1.5)",
            }}
          />
          {/* Half-body astronaut logo — cropped at waist with overflow-hidden */}
          <div className="relative w-10 h-10 overflow-hidden rounded-full">
            <img
              src="/assets/generated/understandify-logo-half.dim_512x512.png"
              alt="Understandify"
              className="w-full h-full object-cover object-top"
              style={{
                filter: "drop-shadow(0 0 6px oklch(0.82 0.18 85 / 0.5))",
                objectPosition: "top center",
              }}
            />
          </div>
        </div>
        <div>
          <h1
            className="font-fredoka text-xl font-bold leading-none text-glow-yellow"
            style={{ color: "oklch(0.82 0.18 85)" }}
          >
            Understandify
          </h1>
          <p
            className="font-nunito text-xs font-semibold leading-none mt-0.5"
            style={{ color: "oklch(0.75 0.20 195)" }}
          >
            {mode === "child" ? "🚀 Learning Mode" : "🔐 Parent Mode"}
          </p>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {mode === "child" && onParentClick && (
          <button
            type="button"
            onClick={onParentClick}
            className="font-nunito text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
            style={{
              background: "oklch(0.20 0.06 265)",
              border: "1px solid oklch(0.35 0.08 265)",
              color: "oklch(0.65 0.05 265)",
            }}
            title="Parent Access"
          >
            🔒 Parent
          </button>
        )}

        {mode === "parent" && onExitParent && (
          <div ref={dropdownRef} className="relative flex items-center gap-2">
            {/* Parent Mode badge */}
            <span
              className="font-nunito text-xs font-bold px-2 py-1 rounded-full"
              style={{
                background: "oklch(0.82 0.18 85 / 0.12)",
                border: "1px solid oklch(0.82 0.18 85 / 0.35)",
                color: "oklch(0.82 0.18 85)",
              }}
            >
              🔐 Parent Mode
            </span>

            {/* Three-dots button */}
            <button
              type="button"
              data-ocid="header.parent_mode.toggle"
              onClick={() => setDotsOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: dotsOpen
                  ? "oklch(0.25 0.07 265)"
                  : "oklch(0.18 0.06 265)",
                border: `1px solid ${dotsOpen ? "oklch(0.40 0.08 265)" : "oklch(0.30 0.07 265)"}`,
              }}
              title="Menu"
              aria-label="Parent mode menu"
              aria-expanded={dotsOpen}
            >
              <MoreVertical
                size={16}
                style={{ color: "oklch(0.70 0.05 265)" }}
              />
            </button>

            {/* Dropdown menu */}
            {dotsOpen && (
              <div
                className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl py-1 overflow-hidden"
                style={{
                  background: "oklch(0.17 0.06 265)",
                  border: "1px solid oklch(0.30 0.07 265)",
                  boxShadow: "0 8px 24px oklch(0.05 0.03 265 / 0.8)",
                }}
              >
                <button
                  type="button"
                  data-ocid="header.exit_parent_mode.button"
                  onClick={() => {
                    setDotsOpen(false);
                    onExitParent();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 font-nunito text-sm font-semibold text-left transition-all hover:bg-white/5"
                  style={{ color: "oklch(0.75 0.20 195)" }}
                >
                  <LogOut size={14} />
                  Exit Parent Mode
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

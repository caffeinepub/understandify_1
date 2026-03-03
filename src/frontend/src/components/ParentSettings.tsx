import { Key, Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useIsParentPinSet, useSetParentPin } from "../hooks/useQueries";
import PinEntryModal from "./PinEntryModal";

const ParentSettings: React.FC = () => {
  const { data: isPinSet } = useIsParentPinSet();
  const setPin = useSetParentPin();
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [pinSetSuccess, setPinSetSuccess] = useState(false);
  const [pinSetError, setPinSetError] = useState<string | null>(null);

  const handleSetPin = async (newPin: string) => {
    setPinSetError(null);
    try {
      await setPin.mutateAsync(newPin);
      setPinSetSuccess(true);
      setShowSetPinModal(false);
      setTimeout(() => setPinSetSuccess(false), 4000);
    } catch {
      setPinSetError(
        "Could not set PIN. It may already be set for this session.",
      );
    }
  };

  return (
    <div className="p-5 space-y-4">
      <h3
        className="font-fredoka text-lg font-bold"
        style={{ color: "oklch(0.82 0.18 85)" }}
      >
        ⚙️ Parent Settings
      </h3>

      {/* PIN Status Card */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.18 0.05 265)",
          border: "1px solid oklch(0.28 0.07 265)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isPinSet
                ? "oklch(0.72 0.22 145 / 0.15)"
                : "oklch(0.78 0.20 45 / 0.15)",
              border: `1px solid ${isPinSet ? "oklch(0.72 0.22 145 / 0.4)" : "oklch(0.78 0.20 45 / 0.4)"}`,
            }}
          >
            <Shield
              size={18}
              style={{
                color: isPinSet
                  ? "oklch(0.72 0.22 145)"
                  : "oklch(0.78 0.20 45)",
              }}
            />
          </div>
          <div>
            <p
              className="font-nunito text-sm font-bold"
              style={{ color: "oklch(0.88 0.03 265)" }}
            >
              Parent PIN
            </p>
            <p
              className="font-nunito text-xs font-semibold"
              style={{
                color: isPinSet
                  ? "oklch(0.72 0.22 145)"
                  : "oklch(0.78 0.20 45)",
              }}
            >
              {isPinSet
                ? "✅ PIN is set and active"
                : "⚠️ No PIN set — using default (1234)"}
            </p>
          </div>
        </div>

        {!isPinSet && (
          <div
            className="rounded-lg p-3 mb-3"
            style={{
              background: "oklch(0.78 0.20 45 / 0.1)",
              border: "1px solid oklch(0.78 0.20 45 / 0.3)",
            }}
          >
            <p
              className="font-nunito text-xs font-semibold"
              style={{ color: "oklch(0.78 0.20 45)" }}
            >
              🔔 For security, please set a custom PIN. The default PIN is{" "}
              <strong style={{ color: "oklch(0.82 0.18 85)" }}>1234</strong>.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setPinSetError(null);
            setShowSetPinModal(true);
          }}
          disabled={!!isPinSet || setPin.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-nunito font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isPinSet
              ? "oklch(0.22 0.06 265)"
              : "oklch(0.82 0.18 85)",
            color: isPinSet ? "oklch(0.55 0.05 265)" : "oklch(0.12 0.04 265)",
            border: isPinSet ? "1px solid oklch(0.30 0.07 265)" : "none",
          }}
        >
          <Key size={16} />
          {isPinSet
            ? "PIN Already Set"
            : setPin.isPending
              ? "Setting PIN..."
              : "Set Parent PIN"}
        </button>

        {isPinSet && (
          <p
            className="font-nunito text-xs text-center mt-2"
            style={{ color: "oklch(0.45 0.05 265)" }}
          >
            PIN can only be set once per session for security.
          </p>
        )}
      </div>

      {/* Success message */}
      {pinSetSuccess && (
        <div
          className="rounded-xl p-4 text-center animate-slide-up"
          style={{
            background: "oklch(0.72 0.22 145 / 0.1)",
            border: "1px solid oklch(0.72 0.22 145 / 0.4)",
          }}
        >
          <p
            className="font-nunito text-sm font-bold"
            style={{ color: "oklch(0.72 0.22 145)" }}
          >
            ✅ PIN set successfully! Keep it safe and don't share it with your
            child.
          </p>
        </div>
      )}

      {/* Error message */}
      {pinSetError && (
        <div
          className="rounded-xl p-4 text-center animate-slide-up"
          style={{
            background: "oklch(0.65 0.22 25 / 0.1)",
            border: "1px solid oklch(0.65 0.22 25 / 0.3)",
          }}
        >
          <p
            className="font-nunito text-sm font-bold"
            style={{ color: "oklch(0.75 0.22 25)" }}
          >
            ❌ {pinSetError}
          </p>
        </div>
      )}

      {/* How it works info card */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.75 0.20 195 / 0.08)",
          border: "1px solid oklch(0.75 0.20 195 / 0.3)",
        }}
      >
        <h4
          className="font-nunito text-sm font-bold mb-3"
          style={{ color: "oklch(0.75 0.20 195)" }}
        >
          🛡️ How Parental Controls Work
        </h4>
        <ul className="space-y-2">
          {[
            {
              icon: "🔒",
              text: "The app starts in Child Mode — safe and locked.",
            },
            { icon: "🔑", text: "A PIN is required to access Parent Mode." },
            {
              icon: "📋",
              text: "All questions your child asks are saved in Search History.",
            },
            {
              icon: "🔔",
              text: "You receive a notification for every question asked.",
            },
            {
              icon: "🚀",
              text: "Math questions use guided hints before revealing answers.",
            },
            { icon: "🛡️", text: "All content is filtered to be child-safe." },
          ].map((item) => (
            <li key={item.icon} className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <span
                className="font-nunito text-xs font-semibold leading-relaxed"
                style={{ color: "oklch(0.70 0.05 265)" }}
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* App info */}
      <div
        className="rounded-xl p-4 text-center"
        style={{
          background: "oklch(0.16 0.05 265)",
          border: "1px solid oklch(0.25 0.06 265)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 overflow-hidden rounded-full">
            <img
              src="/assets/generated/understandify-logo-half.dim_512x512.png"
              alt="Understandify"
              className="w-full h-full object-cover object-top"
              style={{
                filter: "drop-shadow(0 0 4px oklch(0.82 0.18 85 / 0.4))",
              }}
            />
          </div>
          <span
            className="font-fredoka text-base font-bold"
            style={{ color: "oklch(0.82 0.18 85)" }}
          >
            Understandify
          </span>
        </div>
        <p
          className="font-nunito text-xs"
          style={{ color: "oklch(0.45 0.05 265)" }}
        >
          Safe AI Learning for Kids 🚀
        </p>
      </div>

      {/* PIN Setup Modal */}
      {showSetPinModal && (
        <PinEntryModal
          title="Set Parent PIN"
          subtitle="Create a 4-digit PIN to protect Parent Mode"
          onSuccess={handleSetPin}
          onCancel={() => {
            setShowSetPinModal(false);
            setPinSetError(null);
          }}
          isSetupMode={true}
          isLoading={setPin.isPending}
          error={pinSetError}
        />
      )}
    </div>
  );
};

export default ParentSettings;

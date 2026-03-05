import { Key, Lock, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { useIsParentPinSet, useSetParentPin } from "../hooks/useQueries";
import PinEntryModal from "./PinEntryModal";

interface ParentNoticePanelProps {
  onClose: () => void;
}

const ParentNoticePanel: React.FC<ParentNoticePanelProps> = ({ onClose }) => {
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
    <>
      {/* Backdrop */}
      <motion.div
        key="parent-panel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50"
        style={{
          background: "oklch(0.05 0.02 265 / 0.75)",
          backdropFilter: "blur(4px)",
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close parent controls"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
      />

      {/* Bottom sheet */}
      <motion.div
        key="parent-panel-sheet"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.9 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: "oklch(0.13 0.05 265)",
          border: "1.5px solid oklch(0.82 0.18 85 / 0.35)",
          borderBottom: "none",
          boxShadow:
            "0 -8px 40px oklch(0.82 0.18 85 / 0.15), 0 -2px 20px oklch(0.05 0.02 265 / 0.6)",
          maxHeight: "85vh",
        }}
        aria-labelledby="parent-panel-title"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "oklch(0.82 0.18 85 / 0.35)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pb-4 pt-2"
          style={{ borderBottom: "1px solid oklch(0.22 0.06 265)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.82 0.18 85 / 0.15)",
                border: "1.5px solid oklch(0.82 0.18 85 / 0.45)",
                boxShadow: "0 0 12px oklch(0.82 0.18 85 / 0.25)",
              }}
            >
              <Lock size={18} style={{ color: "oklch(0.82 0.18 85)" }} />
            </div>
            <div>
              <h2
                id="parent-panel-title"
                className="font-fredoka text-xl font-bold"
                style={{ color: "oklch(0.82 0.18 85)" }}
              >
                🔐 Parent Controls
              </h2>
              <p
                className="font-nunito text-xs"
                style={{ color: "oklch(0.60 0.05 265)" }}
              >
                Manage parental settings before handing the phone
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: "oklch(0.22 0.06 265)",
              color: "oklch(0.65 0.05 265)",
              border: "1px solid oklch(0.28 0.07 265)",
            }}
            aria-label="Close parent controls"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto px-5 py-4 space-y-4"
          style={{ maxHeight: "55vh" }}
        >
          {/* PIN Status Card */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: isPinSet
                ? "oklch(0.72 0.22 145 / 0.08)"
                : "oklch(0.78 0.20 45 / 0.08)",
              border: `1.5px solid ${isPinSet ? "oklch(0.72 0.22 145 / 0.35)" : "oklch(0.78 0.20 45 / 0.35)"}`,
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
                <ShieldCheck
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
                  Parent PIN Status
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
                    ? "✅ PIN is active — child mode is locked"
                    : "⚠️ No PIN set — using default (1234)"}
                </p>
              </div>
            </div>

            {!isPinSet && (
              <div
                className="rounded-xl p-3 mb-3"
                style={{
                  background: "oklch(0.78 0.20 45 / 0.10)",
                  border: "1px solid oklch(0.78 0.20 45 / 0.30)",
                }}
              >
                <p
                  className="font-nunito text-xs font-semibold"
                  style={{ color: "oklch(0.78 0.20 45)" }}
                >
                  🔔 Set a custom PIN so your child cannot exit the app without
                  your permission. Default PIN is{" "}
                  <strong style={{ color: "oklch(0.82 0.18 85)" }}>1234</strong>
                  .
                </p>
              </div>
            )}

            {!isPinSet ? (
              <button
                type="button"
                data-ocid="parent_notice.set_pin.button"
                onClick={() => {
                  setPinSetError(null);
                  setShowSetPinModal(true);
                }}
                disabled={setPin.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-nunito font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "oklch(0.82 0.18 85)",
                  color: "oklch(0.12 0.04 265)",
                  boxShadow: "0 0 16px oklch(0.82 0.18 85 / 0.3)",
                }}
              >
                <Key size={16} />
                {setPin.isPending ? "Setting PIN..." : "Set Parent PIN"}
              </button>
            ) : (
              <div
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-nunito font-bold text-sm"
                style={{
                  background: "oklch(0.72 0.22 145 / 0.12)",
                  border: "1px solid oklch(0.72 0.22 145 / 0.35)",
                  color: "oklch(0.72 0.22 145)",
                }}
              >
                <ShieldCheck size={16} />
                PIN is active ✅
              </div>
            )}
          </div>

          {/* Success message */}
          <AnimatePresence>
            {pinSetSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl p-4 text-center"
                style={{
                  background: "oklch(0.72 0.22 145 / 0.1)",
                  border: "1px solid oklch(0.72 0.22 145 / 0.4)",
                }}
                data-ocid="parent_notice.success_state"
              >
                <p
                  className="font-nunito text-sm font-bold"
                  style={{ color: "oklch(0.72 0.22 145)" }}
                >
                  ✅ PIN set! Your child cannot exit the app without this PIN.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {pinSetError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl p-4 text-center"
                style={{
                  background: "oklch(0.65 0.22 25 / 0.1)",
                  border: "1px solid oklch(0.65 0.22 25 / 0.3)",
                }}
                data-ocid="parent_notice.error_state"
              >
                <p
                  className="font-nunito text-sm font-bold"
                  style={{ color: "oklch(0.75 0.22 25)" }}
                >
                  ❌ {pinSetError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "oklch(0.75 0.20 195 / 0.07)",
              border: "1px solid oklch(0.75 0.20 195 / 0.25)",
            }}
          >
            <h4
              className="font-nunito text-sm font-bold mb-3"
              style={{ color: "oklch(0.75 0.20 195)" }}
            >
              🛡️ How Parental Lock Works
            </h4>
            <ul className="space-y-2">
              {[
                {
                  icon: "🔒",
                  text: "App always opens in Child Mode — safe and locked.",
                },
                {
                  icon: "🔑",
                  text: "A PIN is required to switch to Parent Mode.",
                },
                {
                  icon: "🚪",
                  text: "Child must enter the PIN to exit this app.",
                },
                {
                  icon: "📋",
                  text: "All questions your child asks are saved in Search History.",
                },
                {
                  icon: "🔔",
                  text: "You receive a notification for every search.",
                },
              ].map((item) => (
                <li key={item.icon} className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0">{item.icon}</span>
                  <span
                    className="font-nunito text-xs font-semibold leading-relaxed"
                    style={{ color: "oklch(0.68 0.05 265)" }}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className="px-5 py-4"
          style={{
            borderTop: "1px solid oklch(0.22 0.06 265)",
            background: "oklch(0.11 0.04 265 / 0.95)",
          }}
        >
          <button
            type="button"
            data-ocid="parent_notice.close.button"
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-fredoka text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.18 85), oklch(0.70 0.22 55))",
              color: "oklch(0.10 0.03 265)",
              boxShadow:
                "0 4px 20px oklch(0.82 0.18 85 / 0.4), 0 2px 6px oklch(0.05 0.02 265 / 0.5)",
            }}
          >
            🚀 Hand Phone to Child
          </button>
        </div>
      </motion.div>

      {/* PIN Setup Modal — rendered on top of the panel */}
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
    </>
  );
};

export default ParentNoticePanel;

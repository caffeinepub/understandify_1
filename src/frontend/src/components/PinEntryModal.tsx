import { Lock, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface PinEntryModalProps {
  title?: string;
  subtitle?: string;
  onSuccess: (pin: string) => void;
  onCancel?: () => void;
  isSetupMode?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

const PinEntryModal: React.FC<PinEntryModalProps> = ({
  title = "Parent Access",
  subtitle = "Enter your 4-digit PIN to continue",
  onSuccess,
  onCancel,
  isSetupMode = false,
  isLoading = false,
  error = null,
}) => {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState<string[]>(["", "", "", ""]);
  const [step, setStep] = useState<"enter" | "confirm">(
    isSetupMode ? "enter" : "enter",
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitInput = (
    index: number,
    value: string,
    pinArr: string[],
    setPinArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  ) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newPin = [...pinArr];
    newPin[index] = digit;
    setPinArr(newPin);

    if (digit && index < 3) {
      refs.current[index + 1]?.focus();
    }

    if (digit && index === 3) {
      const fullPin = [...newPin].join("");
      if (fullPin.length === 4) {
        if (isSetupMode && step === "enter") {
          setTimeout(() => {
            setStep("confirm");
            setConfirmPin(["", "", "", ""]);
            setTimeout(() => confirmRefs.current[0]?.focus(), 100);
          }, 200);
        } else if (isSetupMode && step === "confirm") {
          const enteredPin = pin.join("");
          if (fullPin === enteredPin) {
            setTimeout(() => onSuccess(fullPin), 200);
          } else {
            setLocalError("PINs do not match! Please try again.");
            setConfirmPin(["", "", "", ""]);
            setTimeout(() => confirmRefs.current[0]?.focus(), 100);
          }
        } else {
          setTimeout(() => onSuccess(fullPin), 200);
        }
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    pinArr: string[],
    _setPinArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  ) => {
    if (e.key === "Backspace" && !pinArr[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleNumPad = (digit: string) => {
    const currentPin = step === "confirm" ? confirmPin : pin;
    const setCurrentPin = step === "confirm" ? setConfirmPin : setPin;
    const refs = step === "confirm" ? confirmRefs : inputRefs;

    const emptyIndex = currentPin.findIndex((d) => d === "");
    if (emptyIndex === -1) return;

    handleDigitInput(emptyIndex, digit, currentPin, setCurrentPin, refs);
  };

  const handleBackspace = () => {
    const currentPin = step === "confirm" ? confirmPin : pin;
    const setCurrentPin = step === "confirm" ? setConfirmPin : setPin;
    const refs = step === "confirm" ? confirmRefs : inputRefs;

    const lastFilledIndex = [...currentPin]
      .reverse()
      .findIndex((d) => d !== "");
    if (lastFilledIndex === -1) return;
    const index = 3 - lastFilledIndex;
    const newPin = [...currentPin];
    newPin[index] = "";
    setCurrentPin(newPin);
    refs.current[index]?.focus();
  };

  const displayError = error || localError;
  const currentPinArr = step === "confirm" ? confirmPin : pin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={-1}
        className="absolute inset-0"
        style={{
          background: "oklch(0.05 0.02 265 / 0.9)",
          backdropFilter: "blur(8px)",
        }}
        onClick={onCancel}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel?.();
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm animate-bounce-in"
        style={{
          background: "oklch(0.14 0.05 265)",
          border: "2px solid oklch(0.82 0.18 85)",
          borderRadius: "1.5rem",
          boxShadow:
            "0 0 40px oklch(0.82 0.18 85 / 0.3), 0 20px 60px oklch(0.05 0.02 265 / 0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.82 0.18 85 / 0.15)",
                border: "1px solid oklch(0.82 0.18 85 / 0.4)",
              }}
            >
              <Lock size={18} style={{ color: "oklch(0.82 0.18 85)" }} />
            </div>
            <div>
              <h2
                className="font-fredoka text-xl font-bold"
                style={{ color: "oklch(0.82 0.18 85)" }}
              >
                {isSetupMode
                  ? step === "enter"
                    ? "Create PIN"
                    : "Confirm PIN"
                  : title}
              </h2>
              <p
                className="font-nunito text-xs"
                style={{ color: "oklch(0.65 0.05 265)" }}
              >
                {isSetupMode
                  ? step === "enter"
                    ? "Choose a 4-digit PIN for parent access"
                    : "Re-enter your PIN to confirm"
                  : subtitle}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "oklch(0.22 0.06 265)",
                color: "oklch(0.65 0.05 265)",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 py-4">
          {(["pos-0", "pos-1", "pos-2", "pos-3"] as const).map((posId, i) => {
            const digit = currentPinArr[i];
            return (
              <div
                key={posId}
                className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: digit
                    ? "oklch(0.82 0.18 85 / 0.15)"
                    : "oklch(0.20 0.06 265)",
                  border: `2px solid ${digit ? "oklch(0.82 0.18 85)" : "oklch(0.30 0.07 265)"}`,
                  boxShadow: digit
                    ? "0 0 10px oklch(0.82 0.18 85 / 0.3)"
                    : "none",
                }}
              >
                <input
                  ref={(el) => {
                    if (step === "confirm") confirmRefs.current[i] = el;
                    else inputRefs.current[i] = el;
                  }}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleDigitInput(
                      i,
                      e.target.value,
                      currentPinArr,
                      step === "confirm" ? setConfirmPin : setPin,
                      step === "confirm" ? confirmRefs : inputRefs,
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(
                      i,
                      e,
                      currentPinArr,
                      step === "confirm" ? setConfirmPin : setPin,
                      step === "confirm" ? confirmRefs : inputRefs,
                    )
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  inputMode="numeric"
                />
                {digit ? (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: "oklch(0.82 0.18 85)" }}
                  />
                ) : (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "oklch(0.35 0.07 265)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {displayError && (
          <div
            className="mx-5 mb-3 px-4 py-2 rounded-xl text-center font-nunito text-sm font-semibold animate-slide-up"
            style={{
              background: "oklch(0.65 0.22 25 / 0.15)",
              border: "1px solid oklch(0.65 0.22 25 / 0.4)",
              color: "oklch(0.75 0.22 25)",
            }}
          >
            ❌ {displayError}
          </div>
        )}

        {/* Number Pad */}
        <div className="p-5 pt-2">
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
              (key, i) => (
                <button
                  type="button"
                  key={`numpad-${key || `empty-${i}`}`}
                  onClick={() => {
                    if (key === "⌫") handleBackspace();
                    else if (key !== "") handleNumPad(key);
                  }}
                  disabled={isLoading || key === ""}
                  className={`h-14 rounded-2xl font-fredoka text-2xl font-bold transition-all duration-150 ${
                    key === "" ? "invisible" : "hover:scale-105 active:scale-95"
                  }`}
                  style={{
                    background:
                      key === "⌫"
                        ? "oklch(0.65 0.22 25 / 0.15)"
                        : "oklch(0.20 0.06 265)",
                    border: `1px solid ${key === "⌫" ? "oklch(0.65 0.22 25 / 0.3)" : "oklch(0.30 0.07 265)"}`,
                    color:
                      key === "⌫"
                        ? "oklch(0.75 0.22 25)"
                        : "oklch(0.90 0.02 265)",
                    boxShadow: "0 2px 8px oklch(0.05 0.02 265 / 0.5)",
                  }}
                >
                  {isLoading && key === "0" ? "..." : key}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Default PIN hint for first setup */}
        {!isSetupMode && (
          <p
            className="text-center font-nunito text-xs pb-4"
            style={{ color: "oklch(0.50 0.05 265)" }}
          >
            Default PIN:{" "}
            <span style={{ color: "oklch(0.82 0.18 85)" }}>1234</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PinEntryModal;

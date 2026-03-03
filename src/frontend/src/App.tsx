import type React from "react";
import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
import ChildMode from "./components/ChildMode";
import ParentMode from "./components/ParentMode";
import PinEntryModal from "./components/PinEntryModal";
import SpaceBackground from "./components/SpaceBackground";
import SplashScreen from "./components/SplashScreen";
import {
  useAuthenticateParentMode,
  useIsParentPinSet,
} from "./hooks/useQueries";

type AppMode = "child" | "parent";
type ModalReason = "switch-to-parent" | "exit-attempt" | null;

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState<AppMode>("child");
  const [showPinModal, setShowPinModal] = useState(false);
  const [modalReason, setModalReason] = useState<ModalReason>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const { data: isPinSet } = useIsParentPinSet();
  const authenticate = useAuthenticateParentMode();

  // Show PIN modal on first load if no PIN is set (prompt parent to set one)
  // We don't auto-show setup — parent can do it from settings

  const handleParentButtonClick = () => {
    setPinError(null);
    setModalReason("switch-to-parent");
    setShowPinModal(true);
  };

  const handleExitAttempt = () => {
    setPinError(null);
    setModalReason("exit-attempt");
    setShowPinModal(true);
  };

  const handlePinSuccess = async (pin: string) => {
    setPinError(null);

    // If no PIN is set yet, default PIN is 1234
    if (!isPinSet) {
      if (pin === "1234") {
        if (modalReason === "switch-to-parent") {
          setMode("parent");
        }
        setShowPinModal(false);
        setModalReason(null);
      } else {
        setPinError("Wrong PIN! Try the default PIN: 1234");
      }
      return;
    }

    try {
      const isValid = await authenticate.mutateAsync(pin);
      if (isValid) {
        if (modalReason === "switch-to-parent") {
          setMode("parent");
        }
        // For exit-attempt: if PIN is correct, allow exit
        if (modalReason === "exit-attempt") {
          setShowPinModal(false);
          setModalReason(null);
          // Allow the page to unload
          window.removeEventListener("beforeunload", () => {});
          window.close();
          return;
        }
        setShowPinModal(false);
        setModalReason(null);
      } else {
        setPinError("Wrong PIN! Please try again.");
      }
    } catch {
      setPinError("Something went wrong. Please try again.");
    }
  };

  const handlePinCancel = () => {
    // Only allow cancel if it's not an exit attempt (exit attempt should stay locked)
    if (modalReason === "exit-attempt") {
      // Stay in child mode, don't close
      setShowPinModal(false);
      setModalReason(null);
      return;
    }
    setShowPinModal(false);
    setModalReason(null);
    setPinError(null);
  };

  const handleExitParent = () => {
    setMode("child");
  };

  const getModalTitle = () => {
    if (modalReason === "exit-attempt") return "🔒 Exit Requires PIN";
    return "🔐 Parent Access";
  };

  const getModalSubtitle = () => {
    if (modalReason === "exit-attempt")
      return "Enter your parent PIN to exit the app";
    return "Enter your 4-digit PIN to access Parent Mode";
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Space background always visible */}
      <SpaceBackground />

      {/* Splash screen */}
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}

      {/* Main app */}
      {!showSplash && (
        <div className="relative z-10 flex flex-col min-h-screen">
          <AppHeader
            mode={mode}
            onParentClick={
              mode === "child" ? handleParentButtonClick : undefined
            }
            onExitParent={mode === "parent" ? handleExitParent : undefined}
          />

          <main className="flex-1">
            {mode === "child" ? (
              <ChildMode onExitAttempt={handleExitAttempt} />
            ) : (
              <ParentMode />
            )}
          </main>

          {/* Footer */}
          <footer
            className="relative z-10 py-4 px-4 text-center"
            style={{
              borderTop: "1px solid oklch(0.22 0.06 265)",
              background: "oklch(0.10 0.04 265 / 0.8)",
            }}
          >
            <p
              className="font-nunito text-xs"
              style={{ color: "oklch(0.40 0.05 265)" }}
            >
              © {new Date().getFullYear()} Understandify — Safe Learning for
              Kids 🚀 <span style={{ color: "oklch(0.35 0.05 265)" }}>|</span>{" "}
              Built with{" "}
              <span style={{ color: "oklch(0.72 0.22 340)" }}>♥</span> using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "understandify")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-opacity hover:opacity-80"
                style={{ color: "oklch(0.75 0.20 195)" }}
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      )}

      {/* PIN Entry Modal */}
      {showPinModal && (
        <PinEntryModal
          title={getModalTitle()}
          subtitle={getModalSubtitle()}
          onSuccess={handlePinSuccess}
          onCancel={handlePinCancel}
          isLoading={authenticate.isPending}
          error={pinError}
        />
      )}
    </div>
  );
};

export default App;

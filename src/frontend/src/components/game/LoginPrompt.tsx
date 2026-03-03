import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../../hooks/useBattleZoneQueries";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface LoginPromptProps {
  children: React.ReactNode;
}

export default function LoginPrompt({ children }: LoginPromptProps) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogin = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!playerName.trim()) {
      setNameError("Please enter your callsign");
      return;
    }
    if (playerName.trim().length < 2) {
      setNameError("Callsign must be at least 2 characters");
      return;
    }
    setNameError("");
    await saveProfile.mutateAsync({ name: playerName.trim() });
  };

  if (isInitializing) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bz-dark">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-bz-orange animate-spin" />
          <p className="text-bz-orange font-tactical text-lg tracking-widest">
            INITIALIZING...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: "url(/assets/generated/menu-bg.dim_1920x1080.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-bz-dark/80" />
        <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <img
            src="/assets/generated/battle-zone-logo.dim_800x200.png"
            alt="Battle Zone"
            className="w-full max-w-xs drop-shadow-[0_0_20px_rgba(255,102,0,0.8)]"
          />
          <div className="bz-card w-full flex flex-col items-center gap-6 p-8">
            <Shield className="w-16 h-16 text-bz-orange" />
            <div className="text-center">
              <h2 className="text-bz-orange font-tactical text-2xl font-bold tracking-widest mb-2">
                AUTHENTICATION REQUIRED
              </h2>
              <p className="text-bz-muted text-sm tracking-wide">
                Login to track your kills, matches, and victories
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="bz-btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  LOGIN TO BATTLE ZONE
                </>
              )}
            </button>
            <p className="text-bz-muted text-xs text-center tracking-wide">
              Secure authentication via Internet Identity
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: "url(/assets/generated/menu-bg.dim_1920x1080.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-bz-dark/80" />
        <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <img
            src="/assets/generated/battle-zone-logo.dim_800x200.png"
            alt="Battle Zone"
            className="w-full max-w-xs drop-shadow-[0_0_20px_rgba(255,102,0,0.8)]"
          />
          <div className="bz-card w-full flex flex-col items-center gap-6 p-8">
            <User className="w-16 h-16 text-bz-cyan" />
            <div className="text-center">
              <h2 className="text-bz-cyan font-tactical text-2xl font-bold tracking-widest mb-2">
                SET YOUR CALLSIGN
              </h2>
              <p className="text-bz-muted text-sm tracking-wide">
                Choose your battle name, soldier
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                placeholder="Enter callsign..."
                maxLength={20}
                className="bz-input w-full"
              />
              {nameError && (
                <p className="text-bz-red text-xs tracking-wide">{nameError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saveProfile.isPending}
              className="bz-btn-primary w-full flex items-center justify-center gap-2"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  SAVING...
                </>
              ) : (
                "CONFIRM CALLSIGN"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bz-dark">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-bz-orange animate-spin" />
          <p className="text-bz-orange font-tactical text-lg tracking-widest">
            LOADING PROFILE...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

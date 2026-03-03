import { Camera, Rocket, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
}

const SUBJECT_SUGGESTIONS = [
  { emoji: "🔢", label: "Math", example: "What is 15 + 27?" },
  { emoji: "🔬", label: "Science", example: "Why is the sky blue?" },
  { emoji: "📜", label: "History", example: "Who built the pyramids?" },
  { emoji: "🌍", label: "Geography", example: "What is the largest country?" },
  { emoji: "📝", label: "English", example: "What is a noun?" },
  { emoji: "💻", label: "Technology", example: "What is the internet?" },
];

type CameraFacing = "user" | "environment";

const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [question, setQuestion] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Lens menu popup
  const [lensMenuOpen, setLensMenuOpen] = useState(false);
  const lensMenuRef = useRef<HTMLDivElement>(null);
  const lensButtonRef = useRef<HTMLButtonElement>(null);

  // Album image state
  const [albumPreviewUrl, setAlbumPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleSuggestionClick = (example: string) => {
    setQuestion(example);
    textareaRef.current?.focus();
  };

  // Open lens picker menu
  const handleLensClick = () => {
    setCameraError(null);
    setLensMenuOpen((prev) => !prev);
  };

  // Open camera with specific facing mode
  const openCamera = async (facing: CameraFacing) => {
    setLensMenuOpen(false);
    setCameraError(null);
    setAlbumPreviewUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError(
        "Camera access denied. Please allow camera permission in your browser settings.",
      );
      setTimeout(() => setCameraError(null), 4000);
    }
  };

  // Open album picker
  const handleAlbumClick = () => {
    setLensMenuOpen(false);
    fileInputRef.current?.click();
  };

  // File selected from album
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAlbumPreviewUrl(url);
    setCameraOpen(true);
    // Reset so same file can be selected again
    e.target.value = "";
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    if (albumPreviewUrl) {
      URL.revokeObjectURL(albumPreviewUrl);
      setAlbumPreviewUrl(null);
    }
    setCameraOpen(false);
  };

  // Attach stream to video element when camera opens
  useEffect(() => {
    if (
      cameraOpen &&
      videoRef.current &&
      streamRef.current &&
      !albumPreviewUrl
    ) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen, albumPreviewUrl]);

  // Close lens menu when clicking outside
  useEffect(() => {
    if (!lensMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        lensMenuRef.current &&
        !lensMenuRef.current.contains(e.target as Node) &&
        lensButtonRef.current &&
        !lensButtonRef.current.contains(e.target as Node)
      ) {
        setLensMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [lensMenuOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
      }
      if (albumPreviewUrl) {
        URL.revokeObjectURL(albumPreviewUrl);
      }
    };
  }, [albumPreviewUrl]);

  return (
    <div className="w-full">
      {/* Subject suggestion chips */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {SUBJECT_SUGGESTIONS.map((s) => (
          <button
            type="button"
            key={s.label}
            onClick={() => handleSuggestionClick(s.example)}
            className="font-nunito text-sm font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "oklch(0.20 0.06 265)",
              border: "1px solid oklch(0.30 0.07 265)",
              color: "oklch(0.75 0.05 265)",
            }}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Main input area */}
      <div
        className="relative rounded-2xl transition-all duration-300"
        style={{
          background: "oklch(0.16 0.05 265)",
          border: `2px solid ${isFocused ? "oklch(0.82 0.18 85)" : "oklch(0.28 0.07 265)"}`,
          boxShadow: isFocused ? "0 0 20px oklch(0.82 0.18 85 / 0.25)" : "none",
        }}
      >
        <textarea
          ref={textareaRef}
          value={question}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask me anything! 🚀 What would you like to learn today?"
          rows={4}
          className="w-full bg-transparent font-nunito text-xl font-medium resize-none outline-none px-5 py-5 pr-28 leading-relaxed"
          style={{
            color: "oklch(0.90 0.02 265)",
            minHeight: "120px",
          }}
        />

        {/* Button row — camera lens + send */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          {/* Lens / Camera button with popup menu */}
          <div className="relative">
            <button
              ref={lensButtonRef}
              data-ocid="question.lens_button"
              onClick={handleLensClick}
              type="button"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              title="Visual Search"
              style={{
                background: lensMenuOpen
                  ? "oklch(0.28 0.14 220)"
                  : "oklch(0.22 0.10 220)",
                border: "1px solid oklch(0.38 0.14 220)",
                boxShadow: "0 0 10px oklch(0.72 0.20 220 / 0.25)",
              }}
            >
              <Camera size={17} style={{ color: "oklch(0.78 0.18 210)" }} />
            </button>

            {/* Popup lens menu */}
            {lensMenuOpen && (
              <div
                ref={lensMenuRef}
                data-ocid="question.lens_menu.popover"
                className="absolute bottom-12 right-0 z-30 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: "oklch(0.14 0.06 265)",
                  border: "1px solid oklch(0.30 0.10 220)",
                  boxShadow:
                    "0 8px 32px oklch(0.05 0.03 265 / 0.8), 0 0 0 1px oklch(0.30 0.10 220 / 0.5)",
                  minWidth: "190px",
                }}
              >
                {/* Menu header */}
                <div
                  className="px-3 py-2"
                  style={{ borderBottom: "1px solid oklch(0.22 0.07 265)" }}
                >
                  <span
                    className="font-nunito text-xs font-black tracking-widest uppercase"
                    style={{ color: "oklch(0.55 0.08 220)" }}
                  >
                    📷 Visual Search
                  </span>
                </div>

                {/* Front Camera option */}
                <button
                  type="button"
                  data-ocid="question.front_camera_button"
                  onClick={() => openCamera("user")}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5 active:bg-white/10 text-left"
                >
                  <span className="text-lg">📷</span>
                  <div>
                    <p
                      className="font-nunito text-sm font-bold"
                      style={{ color: "oklch(0.88 0.03 265)" }}
                    >
                      Front Camera
                    </p>
                    <p
                      className="font-nunito text-xs"
                      style={{ color: "oklch(0.48 0.05 265)" }}
                    >
                      Use selfie camera
                    </p>
                  </div>
                </button>

                {/* Back Camera option */}
                <button
                  type="button"
                  data-ocid="question.back_camera_button"
                  onClick={() => openCamera("environment")}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5 active:bg-white/10 text-left"
                  style={{ borderTop: "1px solid oklch(0.20 0.06 265)" }}
                >
                  <span className="text-lg">🔄</span>
                  <div>
                    <p
                      className="font-nunito text-sm font-bold"
                      style={{ color: "oklch(0.88 0.03 265)" }}
                    >
                      Back Camera
                    </p>
                    <p
                      className="font-nunito text-xs"
                      style={{ color: "oklch(0.48 0.05 265)" }}
                    >
                      Use rear camera
                    </p>
                  </div>
                </button>

                {/* Album option */}
                <button
                  type="button"
                  data-ocid="question.album_button"
                  onClick={handleAlbumClick}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5 active:bg-white/10 text-left"
                  style={{ borderTop: "1px solid oklch(0.20 0.06 265)" }}
                >
                  <span className="text-lg">🖼️</span>
                  <div>
                    <p
                      className="font-nunito text-sm font-bold"
                      style={{ color: "oklch(0.88 0.03 265)" }}
                    >
                      Choose from Album
                    </p>
                    <p
                      className="font-nunito text-xs"
                      style={{ color: "oklch(0.48 0.05 265)" }}
                    >
                      Pick an image
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                question.trim() && !isLoading
                  ? "oklch(0.82 0.18 85)"
                  : "oklch(0.25 0.06 265)",
              boxShadow:
                question.trim() && !isLoading
                  ? "0 0 15px oklch(0.82 0.18 85 / 0.4)"
                  : "none",
            }}
          >
            {isLoading ? (
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: "oklch(0.12 0.04 265)",
                  borderTopColor: "transparent",
                }}
              />
            ) : (
              <Rocket size={20} style={{ color: "oklch(0.12 0.04 265)" }} />
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input for album */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* Camera access error */}
      {cameraError && (
        <div
          className="mt-2 px-4 py-2 rounded-xl font-nunito text-sm font-semibold"
          style={{
            background: "oklch(0.65 0.22 25 / 0.12)",
            border: "1px solid oklch(0.65 0.22 25 / 0.35)",
            color: "oklch(0.78 0.18 25)",
          }}
        >
          📷 {cameraError}
        </div>
      )}

      <p
        className="font-nunito text-xs text-center mt-2"
        style={{ color: "oklch(0.45 0.05 265)" }}
      >
        Press Enter to send • Shift+Enter for new line
      </p>

      {/* Camera / Image Preview modal overlay */}
      {cameraOpen && (
        <div
          data-ocid="question.camera_modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "oklch(0.05 0.03 265 / 0.90)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: "oklch(0.12 0.05 265)",
              border: "2px solid oklch(0.78 0.18 210 / 0.5)",
              boxShadow: "0 0 40px oklch(0.72 0.20 210 / 0.3)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid oklch(0.22 0.07 265)" }}
            >
              <div className="flex items-center gap-2">
                <Camera size={16} style={{ color: "oklch(0.78 0.18 210)" }} />
                <span
                  className="font-nunito text-sm font-bold"
                  style={{ color: "oklch(0.88 0.03 265)" }}
                >
                  {albumPreviewUrl ? "🖼️ Image Preview" : "📷 Camera & Search"}
                </span>
              </div>
              <button
                type="button"
                data-ocid="question.camera_close_button"
                onClick={handleCloseCamera}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "oklch(0.20 0.06 265)",
                  border: "1px solid oklch(0.30 0.07 265)",
                }}
              >
                <X size={14} style={{ color: "oklch(0.65 0.05 265)" }} />
              </button>
            </div>

            {/* Video feed OR album image preview */}
            <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
              {albumPreviewUrl ? (
                <img
                  src={albumPreviewUrl}
                  alt="Selected from album"
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Lens focus overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-40 h-40 rounded-2xl"
                      style={{
                        border: "2px solid oklch(0.78 0.18 210 / 0.8)",
                        boxShadow: "0 0 0 9999px oklch(0.05 0.02 265 / 0.4)",
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-4 text-center">
              {albumPreviewUrl ? (
                <>
                  <p
                    className="font-nunito text-xs font-semibold mb-3"
                    style={{ color: "oklch(0.55 0.05 265)" }}
                  >
                    Image selected from your album
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={handleCloseCamera}
                      className="font-nunito text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-105"
                      style={{
                        background: "oklch(0.65 0.20 145)",
                        color: "oklch(0.10 0.04 265)",
                        boxShadow: "0 0 12px oklch(0.65 0.20 145 / 0.35)",
                      }}
                    >
                      ✅ Use this image
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseCamera}
                      className="font-nunito text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-105"
                      style={{
                        background: "oklch(0.22 0.07 265)",
                        border: "1px solid oklch(0.32 0.07 265)",
                        color: "oklch(0.72 0.05 265)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p
                    className="font-nunito text-xs font-semibold mb-3"
                    style={{ color: "oklch(0.55 0.05 265)" }}
                  >
                    Point at an object, text, or image to search
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    className="font-nunito text-sm font-bold px-6 py-2.5 rounded-xl transition-all hover:scale-105"
                    style={{
                      background: "oklch(0.22 0.07 265)",
                      border: "1px solid oklch(0.32 0.07 265)",
                      color: "oklch(0.72 0.05 265)",
                    }}
                  >
                    Close Camera
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionInput;

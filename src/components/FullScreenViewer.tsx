import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Smartphone,
  Layers,
  Copy,
  Check,
  Battery,
  Wifi,
  Flashlight,
  Camera,
  Lock,
  AppWindow,
  Eye,
} from "lucide-react";
import { MockupMode, Wallpaper } from "../types";
import { downloadWallpaper } from "../utils/download";

interface FullScreenViewerProps {
  wallpaper: Wallpaper | null;
  allWallpapers: Wallpaper[];
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (wallpaperId: string) => void;
}

export const FullScreenViewer: React.FC<FullScreenViewerProps> = ({
  wallpaper,
  allWallpapers,
  onClose,
  onRemix,
  onToggleFavorite,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mockupMode, setMockupMode] = useState<MockupMode>("lockscreen");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Time state for realistic phone lockscreen
  const [currentTime, setCurrentTime] = useState<string>("09:41");
  const [currentDate, setCurrentDate] = useState<string>("Monday, August 17");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update current index when selected wallpaper changes
  useEffect(() => {
    if (wallpaper && allWallpapers.length > 0) {
      const idx = allWallpapers.findIndex((w) => w.id === wallpaper.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [wallpaper, allWallpapers]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!wallpaper) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wallpaper, currentIndex, allWallpapers]);

  if (!wallpaper) return null;

  const currentWallpaper = allWallpapers[currentIndex] || wallpaper;

  const handlePrev = () => {
    if (allWallpapers.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allWallpapers.length - 1));
  };

  const handleNext = () => {
    if (allWallpapers.length <= 1) return;
    setCurrentIndex((prev) => (prev < allWallpapers.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadWallpaper(
      currentWallpaper.url,
      currentWallpaper.prompt,
      currentWallpaper.variationIndex
    );
    setTimeout(() => setIsDownloading(false), 800);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentWallpaper.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleRemixClick = () => {
    onRemix(currentWallpaper);
    onClose();
  };

  return (
    <div
      id="fullscreen-wallpaper-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Bar Controls */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 z-50 flex items-center justify-between pointer-events-auto">
        {/* Mockup Mode Selector */}
        <div className="flex items-center bg-neutral-900/80 backdrop-blur-md rounded-xl p-1 border border-neutral-800 shadow-lg">
          <button
            id="mockup-mode-lockscreen"
            type="button"
            onClick={() => setMockupMode("lockscreen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mockupMode === "lockscreen"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock Screen</span>
          </button>

          <button
            id="mockup-mode-homescreen"
            type="button"
            onClick={() => setMockupMode("homescreen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mockupMode === "homescreen"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home Screen</span>
          </button>

          <button
            id="mockup-mode-clean"
            type="button"
            onClick={() => setMockupMode("clean")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mockupMode === "clean"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clean</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          id="close-fullscreen-btn"
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur-md transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Wallpaper Preview Stage */}
      <div className="relative w-full h-full max-h-[88vh] flex items-center justify-center pt-12 pb-20 sm:pb-16">
        {/* Navigation Arrow Left */}
        {allWallpapers.length > 1 && (
          <button
            id="prev-wallpaper-btn"
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-40 p-3 rounded-full bg-neutral-900/70 hover:bg-purple-600 backdrop-blur-md text-white border border-white/10 shadow-xl transition-all active:scale-95"
            title="Previous variation"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Realistic Phone Shell Container */}
        <div
          id="phone-device-frame"
          className="relative h-full max-h-[750px] aspect-[9/19.5] rounded-[42px] sm:rounded-[48px] p-2.5 bg-neutral-900 border-[4px] border-neutral-700/80 shadow-2xl shadow-purple-950/40 flex items-center justify-center overflow-hidden transition-all"
        >
          {/* Inner Phone Screen */}
          <div className="relative w-full h-full rounded-[34px] sm:rounded-[40px] overflow-hidden bg-black flex flex-col justify-between select-none">
            {/* Dynamic Wallpaper Image */}
            <img
              id="fullscreen-image-target"
              src={currentWallpaper.url}
              alt="Full screen wallpaper preview"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Subtle overlay gradients */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Mockup Mode 1: Lock Screen Simulator */}
            {mockupMode === "lockscreen" && (
              <div className="relative z-20 w-full h-full flex flex-col justify-between p-5 text-white pointer-events-none">
                {/* Dynamic Island / Status Bar */}
                <div className="flex items-center justify-between pt-1 px-2 text-xs font-semibold">
                  <span>{currentTime}</span>
                  <div className="w-20 h-4 bg-black rounded-full border border-neutral-800" />
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>

                {/* Clock & Lock Widget */}
                <div className="flex flex-col items-center mt-6">
                  <Lock className="w-4 h-4 text-white/80 mb-1" />
                  <div className="text-xs font-medium text-white/90 tracking-wide">
                    {currentDate}
                  </div>
                  <div className="text-6xl font-light tracking-tight text-white/95 font-sans drop-shadow-md">
                    {currentTime}
                  </div>
                </div>

                {/* Bottom Lockscreen Utilities (Flashlight & Camera) */}
                <div className="flex flex-col items-center gap-4 pb-2">
                  <div className="w-full flex items-center justify-between px-3">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <Flashlight className="w-4 h-4 text-white/90" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white/90" />
                    </div>
                  </div>
                  {/* Home Bar */}
                  <div className="w-28 h-1 bg-white/70 rounded-full" />
                </div>
              </div>
            )}

            {/* Mockup Mode 2: Home Screen Simulator */}
            {mockupMode === "homescreen" && (
              <div className="relative z-20 w-full h-full flex flex-col justify-between p-5 text-white pointer-events-none">
                {/* Status Bar */}
                <div className="flex items-center justify-between pt-1 px-2 text-xs font-semibold">
                  <span>{currentTime}</span>
                  <div className="w-20 h-4 bg-black rounded-full border border-neutral-800" />
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>

                {/* App Icons Grid Silhouette */}
                <div className="space-y-4 px-2 my-auto">
                  {/* Widget */}
                  <div className="w-full h-24 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 p-3 flex flex-col justify-between">
                    <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                      Vibe Glance
                    </div>
                    <div className="text-sm font-medium text-white/90 truncate">
                      {currentWallpaper.prompt}
                    </div>
                    <div className="text-[10px] text-white/60 font-mono">
                      {currentWallpaper.aspectRatio} &bull; {currentWallpaper.imageSize}
                    </div>
                  </div>

                  {/* 4x3 App icons */}
                  <div className="grid grid-cols-4 gap-3 py-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-md" />
                        <div className="w-6 h-1.5 bg-white/40 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dock Bar */}
                <div className="flex flex-col items-center gap-3 pb-2">
                  <div className="w-full py-2.5 px-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-around">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-xl bg-white/25 border border-white/20 shadow"
                      />
                    ))}
                  </div>
                  <div className="w-28 h-1 bg-white/70 rounded-full" />
                </div>
              </div>
            )}

            {/* Mockup Mode 3: Clean Mode (No UI overlays) */}
            {mockupMode === "clean" && (
              <div className="relative z-20 w-full h-full flex flex-col justify-end p-4 pointer-events-none">
                <div className="self-center w-28 h-1 bg-white/60 rounded-full mb-1" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrow Right */}
        {allWallpapers.length > 1 && (
          <button
            id="next-wallpaper-btn"
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-40 p-3 rounded-full bg-neutral-900/70 hover:bg-purple-600 backdrop-blur-md text-white border border-white/10 shadow-xl transition-all active:scale-95"
            title="Next variation"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-2 bg-neutral-900/95 backdrop-blur-md p-2 rounded-2xl border border-neutral-800 shadow-2xl">
        {/* Variation Switcher Pills */}
        {allWallpapers.length > 1 && (
          <div className="flex items-center gap-1 px-1 border-r border-neutral-800 mr-1">
            {allWallpapers.map((w, idx) => (
              <button
                id={`variation-pill-${idx}`}
                key={w.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  idx === currentIndex
                    ? "bg-purple-600 text-white shadow-sm scale-105"
                    : "bg-neutral-800 text-neutral-400 hover:text-white"
                }`}
                title={`Switch to Variation ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Download Button */}
        <button
          id="fullscreen-download-btn"
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all shadow-md"
        >
          <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
          <span>{isDownloading ? "Saving..." : "Download"}</span>
        </button>

        {/* Remix Button */}
        <button
          id="fullscreen-remix-btn"
          type="button"
          onClick={handleRemixClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all shadow-md shadow-purple-600/30"
          title="Use this wallpaper as visual reference for the next batch"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Remix</span>
        </button>

        {/* Favorite Button */}
        <button
          id="fullscreen-fav-btn"
          type="button"
          onClick={() => onToggleFavorite(currentWallpaper.id)}
          className={`p-2.5 rounded-xl border transition-all ${
            currentWallpaper.isFavorite
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700"
          }`}
          title="Toggle favorite"
        >
          <Star
            className={`w-4 h-4 ${
              currentWallpaper.isFavorite ? "fill-amber-400 text-amber-400" : ""
            }`}
          />
        </button>

        {/* Copy Prompt Button */}
        <button
          id="fullscreen-copy-prompt-btn"
          type="button"
          onClick={handleCopyPrompt}
          className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
          title="Copy prompt text"
        >
          {copiedPrompt ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

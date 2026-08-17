import React from "react";
import { Maximize2, Download, RefreshCw, Star, Sparkles } from "lucide-react";
import { Wallpaper } from "../types";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  isGenerating: boolean;
  batchCount?: number;
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  onQuickDownload: (wallpaper: Wallpaper, e: React.MouseEvent) => void;
  onQuickRemix: (wallpaper: Wallpaper, e: React.MouseEvent) => void;
  onToggleFavorite: (wallpaperId: string, e: React.MouseEvent) => void;
}

const VARIATION_LABELS = [
  { num: "1", title: "Cinematic Depth" },
  { num: "2", title: "Intricate Detail" },
  { num: "3", title: "Dynamic Glow" },
  { num: "4", title: "Minimal Harmony" },
];

export const WallpaperGrid: React.FC<WallpaperGridProps> = ({
  wallpapers,
  isGenerating,
  batchCount = 4,
  onSelectWallpaper,
  onQuickDownload,
  onQuickRemix,
  onToggleFavorite,
}) => {
  const count = wallpapers.length > 0 ? wallpapers.length : batchCount;

  // Adaptive grid layout class based on number of items
  const gridLayoutClass =
    count === 1
      ? "grid grid-cols-1 max-w-xs sm:max-w-sm mx-auto gap-4"
      : count === 2
      ? "grid grid-cols-2 max-w-md sm:max-w-xl mx-auto gap-3 sm:gap-4"
      : "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4";

  // Skeleton loader when generating
  if (isGenerating && wallpapers.length === 0) {
    return (
      <div id="wallpaper-loading-grid" className="w-full max-w-4xl mx-auto py-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-sm font-semibold text-neutral-200">
              Generating {batchCount} {batchCount === 1 ? "Unique Variation" : "Unique Variations"}...
            </span>
          </div>
          <span className="text-xs text-neutral-500 font-mono">9:16 Aspect</span>
        </div>

        <div className={gridLayoutClass}>
          {Array.from({ length: batchCount }).map((_, index) => (
            <div
              key={index}
              className="relative aspect-[9/16] rounded-2xl bg-neutral-900 border border-neutral-800/80 overflow-hidden shadow-lg animate-pulse"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900 to-neutral-800/60" />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-neutral-800/80 text-[11px] font-mono text-neutral-400">
                Var #{index + 1}
              </div>
              <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                <div className="h-3 bg-neutral-800 rounded w-3/4" />
                <div className="h-2 bg-neutral-850 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return null;
  }

  return (
    <div id="wallpaper-variations-section" className="w-full max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
            <span>
              {wallpapers.length}{" "}
              {wallpapers.length === 1 ? "Wallpaper Variation" : "Wallpaper Variations"}
            </span>
            {wallpapers[0]?.isRemix && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-900/60 text-purple-300 border border-purple-700/50">
                Remixed Batch
              </span>
            )}
          </h2>
          <p className="text-xs text-neutral-400">
            Tap any wallpaper to preview full-screen with lock screen mockup & download
          </p>
        </div>

        <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
          {wallpapers[0]?.aspectRatio || "9:16"}
        </span>
      </div>

      {/* Item Grid */}
      <div id="wallpaper-grid-container" className={gridLayoutClass}>
        {wallpapers.map((wallpaper, index) => {
          const varLabel = VARIATION_LABELS[index % VARIATION_LABELS.length];
          const is916 = wallpaper.aspectRatio === "9:16";

          return (
            <div
              id={`wallpaper-card-${wallpaper.id}`}
              key={wallpaper.id}
              onClick={() => onSelectWallpaper(wallpaper)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-purple-500/60 shadow-lg hover:shadow-purple-900/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Aspect Ratio Container */}
              <div className={`relative w-full overflow-hidden ${is916 ? "aspect-[9/16]" : "aspect-[3/4]"}`}>
                <img
                  src={wallpaper.url}
                  alt={`Wallpaper Variation ${index + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle top & bottom gradients for legibility */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Top Badge: Variation Number & Favorite */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono font-medium text-white border border-white/10 shadow-sm">
                    #{index + 1} &bull; {varLabel.title}
                  </span>

                  <button
                    id={`fav-btn-${wallpaper.id}`}
                    type="button"
                    onClick={(e) => onToggleFavorite(wallpaper.id, e)}
                    className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                      wallpaper.isFavorite
                        ? "bg-amber-500/30 text-amber-300 border border-amber-400/50"
                        : "bg-black/50 text-white/70 hover:text-white hover:bg-black/75"
                    }`}
                    title={wallpaper.isFavorite ? "Remove favorite" : "Add to favorites"}
                  >
                    <Star className={`w-3.5 h-3.5 ${wallpaper.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                </div>

                {/* Bottom Overlay Actions */}
                <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {/* Quick Download */}
                    <button
                      id={`quick-download-${wallpaper.id}`}
                      type="button"
                      onClick={(e) => onQuickDownload(wallpaper, e)}
                      className="p-2 rounded-xl bg-black/60 hover:bg-purple-600 backdrop-blur-md text-white border border-white/10 shadow-sm transition-all"
                      title="Download wallpaper"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Remix */}
                    <button
                      id={`quick-remix-${wallpaper.id}`}
                      type="button"
                      onClick={(e) => onQuickRemix(wallpaper, e)}
                      className="p-2 rounded-xl bg-black/60 hover:bg-purple-600 backdrop-blur-md text-white border border-white/10 shadow-sm transition-all"
                      title="Remix this variation"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expand Fullscreen */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 group-hover:bg-purple-600 transition-colors">
                    <Maximize2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

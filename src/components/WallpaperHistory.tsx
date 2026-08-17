import React, { useState } from "react";
import { X, Trash2, Download, RefreshCw, Star, Maximize2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Wallpaper } from "../types";
import { downloadWallpaper } from "../utils/download";

interface WallpaperHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  wallpapers: Wallpaper[];
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  onRemix: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (wallpaperId: string) => void;
  onClearHistory: () => void;
}

export const WallpaperHistory: React.FC<WallpaperHistoryProps> = ({
  isOpen,
  onClose,
  wallpapers,
  onSelectWallpaper,
  onRemix,
  onToggleFavorite,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  if (!isOpen) return null;

  const filteredWallpapers =
    filter === "favorites" ? wallpapers.filter((w) => w.isFavorite) : wallpapers;

  return (
    <div
      id="history-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="history-drawer-panel"
        className="w-full max-w-md h-full bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-semibold text-white">Wallpaper Gallery</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              {wallpapers.length}
            </span>
          </div>

          <button
            id="close-history-drawer-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter tabs & Clear button */}
        <div className="px-4 py-3 border-b border-neutral-900 flex items-center justify-between gap-2 bg-neutral-900/40">
          <div className="flex items-center gap-1.5">
            <button
              id="history-filter-all"
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "text-neutral-400 hover:text-white bg-neutral-900"
              }`}
            >
              All ({wallpapers.length})
            </button>
            <button
              id="history-filter-favs"
              type="button"
              onClick={() => setFilter("favorites")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === "favorites"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-neutral-400 hover:text-white bg-neutral-900"
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Favorites ({wallpapers.filter((w) => w.isFavorite).length})</span>
            </button>
          </div>

          {wallpapers.length > 0 && (
            <button
              id="clear-all-history-btn"
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs text-red-400/80 hover:text-red-300 hover:bg-red-950/40 px-2 py-1 rounded-md transition-colors"
              title="Clear all history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredWallpapers.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <Sparkles className="w-8 h-8 mb-2 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-400">
                {filter === "favorites"
                  ? "No favorite wallpapers saved yet."
                  : "No wallpapers generated in this session yet."}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Enter a vibe prompt to generate your first 4 variations!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredWallpapers.map((item) => (
                <div
                  id={`history-item-${item.id}`}
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 shadow-md transition-all"
                >
                  <div
                    className="relative aspect-[9/16] cursor-pointer"
                    onClick={() => {
                      onSelectWallpaper(item);
                      onClose();
                    }}
                  >
                    <img
                      src={item.url}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                    <div className="absolute top-2 right-2">
                      <button
                        id={`history-fav-${item.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className="p-1 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80"
                      >
                        <Star
                          className={`w-3 h-3 ${
                            item.isFavorite ? "fill-amber-400 text-amber-400" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
                      <button
                        id={`history-download-${item.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadWallpaper(item.url, item.prompt, item.variationIndex);
                        }}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-purple-600 text-white backdrop-blur-md transition-colors"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </button>

                      <button
                        id={`history-remix-${item.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemix(item);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-purple-600 text-white backdrop-blur-md transition-colors"
                        title="Remix this"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

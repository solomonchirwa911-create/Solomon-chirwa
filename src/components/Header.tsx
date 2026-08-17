import React from "react";
import { Sparkles, History, BookmarkCheck, Smartphone } from "lucide-react";

interface HeaderProps {
  historyCount: number;
  favoritesCount: number;
  onOpenHistory: () => void;
  onToggleFilterFavorites?: () => void;
  showingFavoritesOnly?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  favoritesCount,
  onOpenHistory,
  onToggleFilterFavorites,
  showingFavoritesOnly = false,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/60 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold tracking-tight text-white">
                Phone Wallpaper AI
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-950/80 text-purple-300 border border-purple-800/40">
                4 Variations
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Describe your vibe &bull; Generate 9:16 wallpapers &bull; Remix instantly
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onToggleFilterFavorites && (
            <button
              id="header-favorites-btn"
              onClick={onToggleFilterFavorites}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showingFavoritesOnly
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800"
              }`}
              title="Filter favorite wallpapers"
            >
              <BookmarkCheck className={`w-3.5 h-3.5 ${showingFavoritesOnly ? "text-amber-400 fill-amber-400" : ""}`} />
              <span className="hidden sm:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px] text-neutral-300 font-mono">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          <button
            id="header-history-btn"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-all"
            title="View wallpaper history"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Gallery</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-600 text-[10px] text-white font-mono leading-none">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

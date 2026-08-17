import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { VibePromptInput } from "./components/VibePromptInput";
import { WallpaperGrid } from "./components/WallpaperGrid";
import { FullScreenViewer } from "./components/FullScreenViewer";
import { WallpaperHistory } from "./components/WallpaperHistory";
import { AspectRatioType, ImageSizeType, ModelType, Wallpaper } from "./types";
import { downloadWallpaper } from "./utils/download";
import { AlertCircle, Sparkles, RefreshCw, Smartphone, Layers, Wand2 } from "lucide-react";

export default function App() {
  const [prompt, setPrompt] = useState<string>("rainy cyberpunk lo-fi");
  const [referenceWallpaper, setReferenceWallpaper] = useState<Wallpaper | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("9:16");
  const [imageSize, setImageSize] = useState<ImageSizeType>("1K");
  const [model, setModel] = useState<ModelType>("gemini-3-pro-image-preview");
  const [batchCount, setBatchCount] = useState<number>(4);

  const [currentWallpapers, setCurrentWallpapers] = useState<Wallpaper[]>([]);
  const [history, setHistory] = useState<Wallpaper[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [showingFavoritesOnly, setShowingFavoritesOnly] = useState<boolean>(false);

  // Load saved history and favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("phone_wallpapers_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setCurrentWallpapers(parsed.slice(0, 4));
        }
      }
    } catch (e) {
      console.warn("Could not load wallpapers from localStorage:", e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: Wallpaper[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("phone_wallpapers_history", JSON.stringify(newHistory.slice(0, 40)));
    } catch (e) {
      console.warn("Could not save wallpapers to localStorage:", e);
    }
  };

  // Main Generation Handler
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const payload: any = {
        prompt: prompt.trim(),
        aspectRatio,
        imageSize,
        model,
        count: batchCount,
      };

      if (referenceWallpaper && referenceWallpaper.url) {
        payload.referenceImage = {
          data: referenceWallpaper.url,
          mimeType: "image/png",
        };
      }

      const response = await fetch("/api/generate-wallpapers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate wallpapers");
      }

      const generated: Wallpaper[] = data.wallpapers || [];
      if (generated.length > 0) {
        setCurrentWallpapers(generated);
        // Prepend to history
        const updatedHistory = [...generated, ...history];
        saveHistory(updatedHistory);
      } else {
        throw new Error("No wallpapers were returned from the model.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err?.message || "An error occurred while generating wallpapers. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Remix Handler: Set the chosen wallpaper as visual reference
  const handleRemix = (wallpaper: Wallpaper) => {
    setReferenceWallpaper(wallpaper);
    setPrompt((prev) => (prev ? prev : wallpaper.prompt));
    // Scroll smoothly to the prompt area
    const promptElem = document.getElementById("vibe-prompt-section");
    if (promptElem) {
      promptElem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleClearReference = () => {
    setReferenceWallpaper(null);
  };

  // Quick Download from Card
  const handleQuickDownload = async (wallpaper: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadWallpaper(wallpaper.url, wallpaper.prompt, wallpaper.variationIndex);
  };

  // Quick Remix from Card
  const handleQuickRemix = (wallpaper: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    handleRemix(wallpaper);
  };

  // Toggle Favorite
  const handleToggleFavorite = (wallpaperId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const updateFavList = (list: Wallpaper[]) =>
      list.map((w) => (w.id === wallpaperId ? { ...w, isFavorite: !w.isFavorite } : w));

    const updatedHistory = updateFavList(history);
    saveHistory(updatedHistory);
    setCurrentWallpapers(updateFavList(currentWallpapers));

    if (selectedWallpaper && selectedWallpaper.id === wallpaperId) {
      setSelectedWallpaper((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all wallpaper gallery history?")) {
      saveHistory([]);
      setCurrentWallpapers([]);
    }
  };

  const displayedWallpapers = showingFavoritesOnly
    ? history.filter((w) => w.isFavorite)
    : currentWallpapers;

  const favoritesCount = history.filter((w) => w.isFavorite).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-purple-500 selection:text-white font-sans">
      {/* App Header */}
      <Header
        historyCount={history.length}
        favoritesCount={favoritesCount}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleFilterFavorites={() => setShowingFavoritesOnly(!showingFavoritesOnly)}
        showingFavoritesOnly={showingFavoritesOnly}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Vibe Prompt & Parameters Input */}
        <VibePromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          referenceWallpaper={referenceWallpaper}
          onClearReference={handleClearReference}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          imageSize={imageSize}
          setImageSize={setImageSize}
          model={model}
          setModel={setModel}
          batchCount={batchCount}
          setBatchCount={setBatchCount}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        {/* Error Notification Alert */}
        {error && (
          <div
            id="generation-error-alert"
            className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm flex items-start gap-3 animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-red-300">Generation Notice</div>
              <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-xs font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Wallpapers Variations Grid */}
        <WallpaperGrid
          wallpapers={displayedWallpapers}
          isGenerating={isGenerating}
          batchCount={batchCount}
          onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
          onQuickDownload={handleQuickDownload}
          onQuickRemix={handleQuickRemix}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Empty State when no generation has happened yet */}
        {!isGenerating && currentWallpapers.length === 0 && (
          <div
            id="empty-starter-prompt"
            className="rounded-2xl border border-dashed border-neutral-800 p-8 sm:p-12 text-center bg-neutral-900/30 max-w-xl mx-auto"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-purple-950/50">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Create Your First Batch</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
              Describe your current aesthetic or pick a vibe preset above to generate 4 custom 9:16 wallpapers.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Sample Batch</span>
            </button>
          </div>
        )}
      </main>

      {/* Full-Screen Lightbox / Device Simulator Modal */}
      <FullScreenViewer
        wallpaper={selectedWallpaper}
        allWallpapers={displayedWallpapers.length > 0 ? displayedWallpapers : currentWallpapers}
        onClose={() => setSelectedWallpaper(null)}
        onRemix={handleRemix}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
      />

      {/* Gallery History Drawer */}
      <WallpaperHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        wallpapers={history}
        onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
        onRemix={handleRemix}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}

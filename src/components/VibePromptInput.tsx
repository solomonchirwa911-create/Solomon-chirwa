import React, { useState } from "react";
import { Sparkles, Dices, SlidersHorizontal, X, ArrowRight, RefreshCw, Layers, ChevronDown } from "lucide-react";
import { VIBE_PRESETS, RANDOM_VIBES } from "../data/presets";
import { AspectRatioType, ImageSizeType, ModelType, Wallpaper } from "../types";

interface VibePromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  referenceWallpaper: Wallpaper | null;
  onClearReference: () => void;
  aspectRatio: AspectRatioType;
  setAspectRatio: (value: AspectRatioType) => void;
  imageSize: ImageSizeType;
  setImageSize: (value: ImageSizeType) => void;
  model: ModelType;
  setModel: (value: ModelType) => void;
  batchCount: number;
  setBatchCount: (value: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const BATCH_COUNT_OPTIONS = [
  { value: 1, label: "1 Wallpaper", short: "1x", desc: "Single Generation" },
  { value: 2, label: "2 Wallpapers", short: "2x", desc: "Dual Variations" },
  { value: 4, label: "4 Wallpapers", short: "4x", desc: "Full Batch (Recommended)" },
];

const ASPECT_RATIO_OPTIONS: { value: AspectRatioType; label: string; desc: string }[] = [
  { value: "9:16", label: "9:16", desc: "Phone Wallpaper (Default)" },
  { value: "1:1", label: "1:1", desc: "Square" },
  { value: "2:3", label: "2:3", desc: "Portrait" },
  { value: "3:2", label: "3:2", desc: "Landscape" },
  { value: "3:4", label: "3:4", desc: "Tablet" },
  { value: "4:3", label: "4:3", desc: "Photo" },
  { value: "16:9", label: "16:9", desc: "Desktop" },
  { value: "21:9", label: "21:9", desc: "Ultra-wide" },
];

const SIZE_OPTIONS: { value: ImageSizeType; label: string; desc: string }[] = [
  { value: "1K", label: "1K", desc: "Fast & Crisp (Standard)" },
  { value: "2K", label: "2K", desc: "High Definition" },
  { value: "4K", label: "4K", desc: "Ultra Studio Quality" },
];

export const VibePromptInput: React.FC<VibePromptInputProps> = ({
  prompt,
  setPrompt,
  referenceWallpaper,
  onClearReference,
  aspectRatio,
  setAspectRatio,
  imageSize,
  setImageSize,
  model,
  setModel,
  batchCount,
  setBatchCount,
  isGenerating,
  onGenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showCountDropdown, setShowCountDropdown] = useState<boolean>(false);

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_VIBES.length);
    setPrompt(RANDOM_VIBES[randomIndex]);
  };

  const handleSelectPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isGenerating && prompt.trim()) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div id="vibe-prompt-section" className="w-full max-w-4xl mx-auto space-y-4">
      {/* Main Card */}
      <div className="bg-neutral-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-xl shadow-black/40">
        {/* Remix Reference Image banner */}
        {referenceWallpaper && (
          <div
            id="remix-reference-badge"
            className="mb-3.5 flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-purple-500/40 shadow-sm bg-neutral-950">
                <img
                  src={referenceWallpaper.url}
                  alt="Reference wallpaper"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[9px] font-mono text-center text-purple-200">
                  Ref
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
                  <span className="text-xs font-semibold text-purple-300">
                    Remixing Mode Active
                  </span>
                </div>
                <p className="text-[11px] text-purple-300/80 truncate">
                  Using selected wallpaper as visual reference for the next batch of {batchCount}.
                </p>
              </div>
            </div>

            <button
              id="clear-remix-reference-btn"
              onClick={onClearReference}
              className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors ml-2 shrink-0"
              title="Remove reference image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input box */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="vibe-input" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Describe your desired vibe:</span>
            </label>
            <button
              id="surprise-me-btn"
              type="button"
              onClick={handleSurpriseMe}
              disabled={isGenerating}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Surprise Me</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              id="vibe-input"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder='e.g., "rainy cyberpunk lo-fi street", "studio ghibli meadow", "oled neon dark minimalist"'
              className="w-full bg-neutral-950 text-white placeholder-neutral-500 rounded-xl px-3.5 py-3 text-sm sm:text-base border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none shadow-inner"
            />
            {prompt && (
              <button
                id="clear-prompt-btn"
                type="button"
                onClick={() => setPrompt("")}
                disabled={isGenerating}
                className="absolute top-2.5 right-2.5 p-1 text-neutral-400 hover:text-neutral-200 rounded-md hover:bg-neutral-800 transition-colors"
                title="Clear text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Vibe Preset Chips */}
        <div id="vibe-presets-section" className="mt-3 pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Vibe Presets</span>
              <span className="text-[10px] text-neutral-500 font-normal">(tap to auto-fill)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth">
            {VIBE_PRESETS.map((preset) => {
              const isSelected = prompt === preset.prompt;
              return (
                <button
                  id={`vibe-preset-chip-${preset.id}`}
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.prompt)}
                  disabled={isGenerating}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                    isSelected
                      ? "bg-purple-900/70 text-purple-100 border-purple-500 shadow-md shadow-purple-950/50 scale-[1.02]"
                      : "bg-neutral-950/80 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700 hover:bg-neutral-900"
                  }`}
                  title={preset.prompt}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isSelected ? "bg-purple-400 animate-pulse" : "bg-neutral-600 group-hover:bg-purple-400"
                    }`}
                  />
                  <span>{preset.label}</span>
                  {preset.tag && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-normal transition-colors ${
                        isSelected
                          ? "bg-purple-950 text-purple-300 border border-purple-700/40"
                          : "bg-neutral-900 text-neutral-500 group-hover:text-neutral-400"
                      }`}
                    >
                      {preset.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Settings Row */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {/* Batch Count Dropdown Component */}
            <div className="relative">
              <button
                id="batch-count-dropdown-btn"
                type="button"
                onClick={() => setShowCountDropdown(!showCountDropdown)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-all"
                title="Select number of wallpapers per batch"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold text-white">{batchCount}</span>
                <span>{batchCount === 1 ? "Wallpaper" : "Wallpapers"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* Dropdown Menu */}
              {showCountDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowCountDropdown(false)}
                  />
                  <div
                    id="batch-count-menu"
                    className="absolute left-0 bottom-full mb-1.5 z-30 w-48 bg-neutral-950 border border-neutral-800 rounded-xl p-1 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                      Batch Quantity
                    </div>
                    {BATCH_COUNT_OPTIONS.map((opt) => (
                      <button
                        id={`batch-count-opt-${opt.value}`}
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setBatchCount(opt.value);
                          setShowCountDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                          batchCount === opt.value
                            ? "bg-purple-600/30 text-purple-200 font-semibold border border-purple-500/40"
                            : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">{opt.desc}</span>
                        </div>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400">
                          {opt.short}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Settings Toggle */}
            <button
              id="toggle-advanced-settings-btn"
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showAdvanced || aspectRatio !== "9:16" || imageSize !== "1K"
                  ? "bg-purple-950/50 text-purple-300 border border-purple-800/40"
                  : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Options ({aspectRatio} &bull; {imageSize})</span>
            </button>
          </div>

          {/* Generate Button */}
          <button
            id="generate-wallpapers-btn"
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/25 active:scale-[0.98] transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {referenceWallpaper
                    ? `Remixing ${batchCount} ${batchCount === 1 ? "Variation" : "Variations"}...`
                    : `Generating ${batchCount} ${batchCount === 1 ? "Variation" : "Variations"}...`}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {referenceWallpaper
                    ? `Generate ${batchCount} ${batchCount === 1 ? "Remix" : "Remixes"}`
                    : `Generate ${batchCount} ${batchCount === 1 ? "Wallpaper" : "Wallpapers"}`}
                </span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Advanced Options Accordion */}
        {showAdvanced && (
          <div
            id="advanced-options-panel"
            className="mt-3.5 pt-3.5 border-t border-neutral-800 space-y-3.5 text-xs text-neutral-300 animate-in fade-in duration-200"
          >
            {/* Batch Count Selector in Options Panel as well */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-neutral-300">Batch Quantity (Wallpapers per generation):</span>
                <span className="text-[11px] text-neutral-400">
                  {BATCH_COUNT_OPTIONS.find((b) => b.value === batchCount)?.desc}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {BATCH_COUNT_OPTIONS.map((opt) => (
                  <button
                    id={`advanced-batch-count-${opt.value}`}
                    key={opt.value}
                    type="button"
                    onClick={() => setBatchCount(opt.value)}
                    disabled={isGenerating}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center border transition-all ${
                      batchCount === opt.value
                        ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-[10px] font-normal opacity-80">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-neutral-300">Aspect Ratio:</span>
                <span className="text-[11px] text-neutral-400">
                  {ASPECT_RATIO_OPTIONS.find((o) => o.value === aspectRatio)?.desc}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {ASPECT_RATIO_OPTIONS.map((opt) => (
                  <button
                    id={`aspect-ratio-${opt.value.replace(":", "-")}`}
                    key={opt.value}
                    type="button"
                    onClick={() => setAspectRatio(opt.value)}
                    disabled={isGenerating}
                    className={`py-1.5 px-2 rounded-lg font-mono text-xs font-semibold text-center border transition-all ${
                      aspectRatio === opt.value
                        ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Resolution / Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-neutral-300">Resolution Size:</span>
                  <span className="text-[11px] text-neutral-400">
                    {SIZE_OPTIONS.find((s) => s.value === imageSize)?.desc}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      id={`size-option-${opt.value}`}
                      key={opt.value}
                      type="button"
                      onClick={() => setImageSize(opt.value)}
                      disabled={isGenerating}
                      className={`py-1.5 px-2 rounded-lg font-mono text-xs font-semibold text-center border transition-all ${
                        imageSize === opt.value
                          ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Choice */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-neutral-300">AI Model Engine:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    id="model-gemini-3-pro"
                    type="button"
                    onClick={() => setModel("gemini-3-pro-image-preview")}
                    disabled={isGenerating}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center border transition-all ${
                      model === "gemini-3-pro-image-preview"
                        ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    Studio Pro (gemini-3-pro)
                  </button>
                  <button
                    id="model-gemini-3-flash"
                    type="button"
                    onClick={() => setModel("gemini-3.1-flash-image-preview")}
                    disabled={isGenerating}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center border transition-all ${
                      model === "gemini-3.1-flash-image-preview"
                        ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    Fast Flash (gemini-3.1-flash)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

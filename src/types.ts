export interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  variationIndex: number;
  modifier?: string;
  aspectRatio: string;
  imageSize: string;
  model: string;
  isRemix?: boolean;
  remixSourceId?: string;
  createdAt: number;
  isFavorite?: boolean;
}

export interface WallpaperBatch {
  id: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
  imageSize: string;
  model: string;
  isRemix: boolean;
  wallpapers: Wallpaper[];
}

export interface VibePreset {
  id: string;
  label: string;
  tag: string;
  prompt: string;
  category: "cyberpunk" | "nature" | "minimal" | "retro" | "abstract" | "anime";
}

export type AspectRatioType = "9:16" | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "16:9" | "21:9";
export type ImageSizeType = "512px" | "1K" | "2K" | "4K";
export type ModelType = "gemini-3-pro-image-preview" | "gemini-3.1-flash-image-preview";
export type MockupMode = "clean" | "lockscreen" | "homescreen";

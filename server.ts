import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Variation styling nudges to ensure 4 distinct, rich compositions for a single vibe
const VARIATION_MODIFIERS = [
  "cinematic wide-angle composition with atmospheric depth, rich textures, and dramatic lighting",
  "intimate close-up perspective with exquisite intricate details, ambient mood, and subtle color palette",
  "surreal artistic rendition with vibrant dynamic glow, deep contrast, and ethereal geometry",
  "minimalist clean composition with balanced negative space, soft volumetric lighting, and serene harmony",
];

async function startServer() {
  const app = express();

  // Allow larger payload for base64 reference images during remixing
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Wallpaper Generation Endpoint
  app.post("/api/generate-wallpapers", async (req, res) => {
    try {
      const {
        prompt,
        referenceImage,
        aspectRatio = "9:16",
        imageSize = "1K",
        model = "gemini-3-pro-image-preview",
        count = 4,
      } = req.body;

      if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
        return res.status(400).json({ error: "A descriptive vibe prompt is required." });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in environment variables. Please check Settings > Secrets.",
        });
      }

      // Valid aspect ratios supported: "1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "1:8", "4:1", "8:1"
      const validAspectRatios = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "1:8", "4:1", "8:1"];
      const targetAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "9:16";

      // Valid image sizes: "512px", "1K", "2K", "4K"
      const validImageSizes = ["512px", "1K", "2K", "4K"];
      const targetImageSize = validImageSizes.includes(imageSize) ? imageSize : "1K";

      // Model mapping: use gemini-3-pro-image-preview or gemini-3.1-flash-image-preview
      const targetModel = model.includes("flash")
        ? "gemini-3.1-flash-image-preview"
        : "gemini-3-pro-image-preview";

      const variationsCount = Math.min(Math.max(1, count), 4);
      const isRemix = Boolean(referenceImage && referenceImage.data);

      console.log(`[Wallpaper Gen] Generating ${variationsCount} variations for prompt: "${prompt}" | Remix: ${isRemix} | Model: ${targetModel} | Aspect: ${targetAspectRatio} | Size: ${targetImageSize}`);

      // Generate variations in parallel with tailored nuance prompts
      const generationPromises = Array.from({ length: variationsCount }, async (_, index) => {
        const modifier = VARIATION_MODIFIERS[index % VARIATION_MODIFIERS.length];
        
        let contentsParts: any[] = [];

        if (isRemix) {
          // If remixing an existing wallpaper
          const cleanBase64 = referenceImage.data.includes(",")
            ? referenceImage.data.split(",")[1]
            : referenceImage.data;
          
          const mimeType = referenceImage.mimeType || "image/png";

          contentsParts = [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: `Remix and reimagine this reference image into a stunning phone wallpaper with the vibe: "${prompt.trim()}". Variation ${index + 1}: ${modifier}. Maintain aesthetic visual harmony, high aesthetic fidelity, mobile wallpaper framing, no watermarks, no UI elements.`,
            },
          ];
        } else {
          // New wallpaper batch
          contentsParts = [
            {
              text: `Create a breathtaking, high-aesthetic mobile phone wallpaper based on the vibe: "${prompt.trim()}". Variation ${index + 1}: ${modifier}. Optimized for smartphone screen lockscreen/homescreen background with clear visual focal points, rich depth, pristine color grading, no text, no watermarks, no phone frames.`,
            },
          ];
        }

        const response = await ai.models.generateContent({
          model: targetModel,
          contents: {
            parts: contentsParts,
          },
          config: {
            imageConfig: {
              aspectRatio: targetAspectRatio as any,
              imageSize: targetImageSize as any,
            },
          },
        });

        // Extract image data
        let imageUrl: string | null = null;
        let candidateText = "";

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || "image/png";
              imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            } else if (part.text) {
              candidateText += part.text;
            }
          }
        }

        if (!imageUrl) {
          throw new Error(`Variation ${index + 1} did not return image data. ${candidateText ? `Model note: ${candidateText}` : ""}`);
        }

        return {
          id: `wp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
          url: imageUrl,
          prompt: prompt.trim(),
          variationIndex: index + 1,
          modifier: modifier,
          aspectRatio: targetAspectRatio,
          imageSize: targetImageSize,
          model: targetModel,
          isRemix: isRemix,
          createdAt: Date.now(),
        };
      });

      // Settle all generation promises
      const results = await Promise.allSettled(generationPromises);
      const successfulWallpapers = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map((r) => r.value);

      if (successfulWallpapers.length === 0) {
        const firstError = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
        console.error("All generation attempts failed:", firstError?.reason);
        return res.status(500).json({
          error: firstError?.reason?.message || "Failed to generate wallpaper variations. Please try a different vibe description.",
        });
      }

      return res.json({
        success: true,
        wallpapers: successfulWallpapers,
        totalGenerated: successfulWallpapers.length,
        prompt: prompt.trim(),
        isRemix: isRemix,
        aspectRatio: targetAspectRatio,
        imageSize: targetImageSize,
      });
    } catch (error: any) {
      console.error("Error generating wallpapers:", error);
      return res.status(500).json({
        error: error?.message || "An unexpected error occurred during wallpaper generation.",
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wallpaper generator server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

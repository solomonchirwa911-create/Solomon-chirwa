/**
 * Triggers a direct download of a wallpaper image with a descriptive filename
 */
export async function downloadWallpaper(
  url: string,
  prompt: string,
  variationIndex?: number
): Promise<boolean> {
  try {
    const sanitizedPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 24);
    
    const indexSuffix = variationIndex ? `-var${variationIndex}` : "";
    const filename = `wallpaper-${sanitizedPrompt || "vibe"}${indexSuffix}-${Date.now()}.png`;

    // If it's a data URL or blob URL
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    // Otherwise fetch and convert to blob
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error("Failed to download wallpaper:", error);
    return false;
  }
}

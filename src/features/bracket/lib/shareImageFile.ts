export type ShareImageResult = "shared" | "downloaded";

/**
 * Share a generated PNG with the platform share sheet when available (mobile /
 * supported browsers), otherwise fall back to a download. Returns which path was
 * taken so the caller can tailor its confirmation toast. A user-cancelled share
 * (`AbortError`) is swallowed and reported as `"shared"` — nothing went wrong.
 */
export async function shareOrDownloadImage(blob: Blob, fileName: string, shareData?: { title?: string; text?: string }): Promise<ShareImageResult> {
  const file = new File([blob], fileName, { type: "image/png" });

  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav?.canShare?.({ files: [file] }) && typeof nav.share === "function") {
    try {
      await nav.share({ files: [file], title: shareData?.title, text: shareData?.text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "shared";
      // Fall through to download on any other share failure.
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
  return "downloaded";
}

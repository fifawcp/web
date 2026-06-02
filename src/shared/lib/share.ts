type ShareInput = { url: string; title?: string; text?: string };

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareOrCopy({ url, title, text }: ShareInput): Promise<"shared" | "copied" | "dismissed"> {
  if (canNativeShare()) {
    try {
      await navigator.share({ url, title, text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "dismissed";
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

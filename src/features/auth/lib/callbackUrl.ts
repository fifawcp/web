// Accept `raw` only if it's a same-origin path; reject protocol-relative/external to avoid open redirects.
export function safeCallbackUrl(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/")) return "/";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
}

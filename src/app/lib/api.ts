const DEFAULT_PROD_API_BASE_URL = "https://makishop-api.icemage-bk.workers.dev";

function normalizeBaseUrl(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/$/, "");
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getApiBaseUrl(): string {
  const configured = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (configured) return configured;

  if (typeof window !== "undefined" && !isLocalhost(window.location.hostname)) {
    return DEFAULT_PROD_API_BASE_URL;
  }

  return "";
}

const DEFAULT_PROD_API_BASE_URL = "https://makishop-api.icemage-bk.workers.dev";

function normalizeBaseUrl(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  const configured = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (configured) return configured;

  // Всегда используем рабочий API по умолчанию, чтобы локально запросы не уходили в /api на Vite.
  return DEFAULT_PROD_API_BASE_URL;
}

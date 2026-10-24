const PRODUCTION_API_URL = "https://api-manifly.suraise.com/api";

export function apiBaseUrl(): string {
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "manifly.suraise.com"
  ) {
    return PRODUCTION_API_URL;
  }

  if (typeof window === "undefined" && process.env.VERCEL_ENV === "production") {
    return PRODUCTION_API_URL;
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
}

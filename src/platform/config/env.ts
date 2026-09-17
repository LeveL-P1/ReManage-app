export interface PublicEnvironment {
  apiBaseUrl: string;
  demoMode: boolean;
}

export function readPublicEnvironment(source: {
  EXPO_PUBLIC_API_BASE_URL?: string;
  EXPO_PUBLIC_DEMO_MODE?: string;
}): PublicEnvironment {
  const raw = source.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!raw) throw new Error("EXPO_PUBLIC_API_BASE_URL is required");
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL must use http or https");
  }
  return {
    apiBaseUrl: raw.replace(/\/$/, ""),
    demoMode: source.EXPO_PUBLIC_DEMO_MODE === "true",
  };
}

export const publicEnvironment = readPublicEnvironment({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE,
});

export interface PublicEnvironment {
  apiBaseUrl: string;
}

export function readPublicEnvironment(source: {
  EXPO_PUBLIC_API_BASE_URL?: string;
}): PublicEnvironment {
  const raw = source.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!raw) throw new Error("EXPO_PUBLIC_API_BASE_URL is required");
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL must use http or https");
  }
  return { apiBaseUrl: raw.replace(/\/$/, "") };
}

export const publicEnvironment = readPublicEnvironment({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

import { QueryClient } from "@tanstack/react-query";

function httpStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error) || typeof error.status !== "number") {
    return undefined;
  }
  return error.status;
}

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  const status = httpStatus(error);
  if (status === undefined || status === 0) return true;
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
});

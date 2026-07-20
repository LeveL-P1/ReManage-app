import { QueryClient } from "@tanstack/react-query";

function isAuthenticationFailure(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && (error.status === 401 || error.status === 403);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !isAuthenticationFailure(error) && failureCount < 1,
    },
  },
});

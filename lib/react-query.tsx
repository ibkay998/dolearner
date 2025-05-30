"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Custom hooks for admin data
export const adminQueryKeys = {
  all: ['admin'] as const,
  stats: () => [...adminQueryKeys.all, 'stats'] as const,
  challenges: () => [...adminQueryKeys.all, 'challenges'] as const,
  challengesByPath: (pathId: string) => [...adminQueryKeys.challenges(), pathId] as const,
  testCases: () => [...adminQueryKeys.all, 'testCases'] as const,
  testCasesByChallenge: (challengeId: string) => [...adminQueryKeys.testCases(), challengeId] as const,
  learningPaths: () => [...adminQueryKeys.all, 'learningPaths'] as const,
  pathCategories: () => [...adminQueryKeys.all, 'pathCategories'] as const,
  userAnalytics: () => [...adminQueryKeys.all, 'userAnalytics'] as const,
  userStats: () => [...adminQueryKeys.userAnalytics(), 'stats'] as const,
  recentActivity: () => [...adminQueryKeys.userAnalytics(), 'recentActivity'] as const,
  topUsers: () => [...adminQueryKeys.userAnalytics(), 'topUsers'] as const,
};

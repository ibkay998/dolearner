import { useSupabaseAuth } from './use-supabase-auth';
import { useNextChallenge as useNextChallengeQuery } from './use-app-data';

export interface NextChallengeData {
  hasNextChallenge: boolean;
  pathId?: string;
  challengeIndex?: number;
  challenge?: {
    id: string;
    title: string;
    description: string;
  };
  message?: string;
}

export function useNextChallenge() {
  const { user } = useSupabaseAuth();

  // Use React Query hook for fetching next challenge
  const {
    data: nextChallenge,
    isLoading: loading,
    error: queryError,
    refetch
  } = useNextChallengeQuery(user?.id || '');

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Unknown error') : null;

  return {
    nextChallenge,
    loading,
    error,
    refetch
  };
}

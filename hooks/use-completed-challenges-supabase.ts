"use client";


import { useSupabaseAuth } from './use-supabase-auth';
import { useUserCompletions, useCompleteChallenge } from './use-app-data';

export function useCompletedChallengesSupabase() {
  const { user } = useSupabaseAuth();

  // Use React Query hook for fetching completions
  const { data: completedChallenges = [], isLoading: loading } = useUserCompletions(user?.id || '');
  const completeChallengeMutation = useCompleteChallenge();

  // Function to mark a challenge as completed
  const markChallengeCompleted = async (challengeId: string, code: string) => {
    if (!user) {
      console.warn('Cannot mark challenge as completed: User not authenticated');
      return false;
    }

    try {
      await completeChallengeMutation.mutateAsync({
        userId: user.id,
        challengeId,
        code
      });
      return true;
    } catch (error) {
      console.error('Error marking challenge as completed:', error);
      return false;
    }
  };

  // Function to check if a challenge is completed
  const isChallengeCompleted = (challengeId: string): boolean => {
    return completedChallenges.includes(challengeId);
  };

  return {
    completedChallenges,
    markChallengeCompleted,
    isChallengeCompleted,
    loading
  };
}

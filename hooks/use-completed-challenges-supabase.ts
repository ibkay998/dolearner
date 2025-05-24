"use client";

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';

export function useCompletedChallengesSupabase() {
  const { user } = useSupabaseAuth();
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load completed challenges from Supabase when the user changes
  useEffect(() => {
    const loadCompletedChallenges = async () => {
      if (!user) {
        setCompletedChallenges([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch completed challenges from the API endpoint
        const response = await fetch(`/api/challenge-completions?userId=${user.id}`);

        if (!response.ok) {
          console.error('Error loading completed challenges from API:', response.statusText);
          return;
        }

        const result = await response.json();
        setCompletedChallenges(result.completedChallenges || []);
      } catch (error) {
        console.error('Error loading completed challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedChallenges();
  }, [user]);

  // Function to mark a challenge as completed
  const markChallengeCompleted = async (challengeId: string, code: string) => {
    if (!user) {
      console.warn('Cannot mark challenge as completed: User not authenticated');
      return false;
    }

    try {
      // This function is now only used for local state management
      // The actual database insertion is handled by the API in the submit flow
      // Update the local state
      if (!completedChallenges.includes(challengeId)) {
        setCompletedChallenges([...completedChallenges, challengeId]);
      }

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

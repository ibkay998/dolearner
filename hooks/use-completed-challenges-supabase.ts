"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/supabase-provider';
import { useSupabaseAuth } from './use-supabase-auth';

export function useCompletedChallengesSupabase() {
  const { supabase } = useSupabase();
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

        // Fetch completed challenges from Supabase
        const { data, error } = await supabase
          .from('challenge_completions')
          .select('challenge_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading completed challenges from Supabase:', error);
          return;
        }

        // Extract challenge IDs from the response
        const challengeIds = data.map(item => item.challenge_id);
        setCompletedChallenges(challengeIds);
      } catch (error) {
        console.error('Error loading completed challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedChallenges();
  }, [user, supabase]);

  // Function to mark a challenge as completed
  const markChallengeCompleted = async (challengeId: string, code: string) => {
    if (!user) {
      console.warn('Cannot mark challenge as completed: User not authenticated');
      return false;
    }

    try {
      // Insert the completion record into Supabase
      const { error } = await supabase
        .from('challenge_completions')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          code
        }, {
          onConflict: 'user_id,challenge_id'
        });

      if (error) {
        console.error('Error marking challenge as completed:', error);
        return false;
      }

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

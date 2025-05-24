import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';

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
  const [nextChallenge, setNextChallenge] = useState<NextChallengeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextChallenge = async () => {
    if (!user) {
      setNextChallenge(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/next-challenge?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch next challenge');
      }

      const data = await response.json();
      setNextChallenge(data);
    } catch (err) {
      console.error('Error fetching next challenge:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextChallenge();
  }, [user]);

  return {
    nextChallenge,
    loading,
    error,
    refetch: fetchNextChallenge
  };
}

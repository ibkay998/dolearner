import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for main application
interface Challenge {
  id: string;
  legacy_id: string;
  path_id: string;
  title: string;
  description: string;
  instructions: string;
  starter_code: string;
  solution_code: string;
  difficulty: string;
  challenge_type: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  path?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ChallengeCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  submitted_code: string;
  completed_at: string;
  completion_data: any;
}

interface UserPathEnrollment {
  id: string;
  user_id: string;
  path_id: string;
  enrolled_at: string;
  is_active: boolean;
  progress_data: any;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  slug: string;
  category_id: string;
  difficulty_level: string;
  icon_name: string;
  color_scheme: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Query keys for main application
export const appQueryKeys = {
  all: ['app'] as const,
  challenges: () => [...appQueryKeys.all, 'challenges'] as const,
  challengesByPath: (pathSlug: string) => [...appQueryKeys.challenges(), pathSlug] as const,
  challenge: (id: string) => [...appQueryKeys.challenges(), id] as const,
  completions: () => [...appQueryKeys.all, 'completions'] as const,
  userCompletions: (userId: string) => [...appQueryKeys.completions(), userId] as const,
  enrollments: () => [...appQueryKeys.all, 'enrollments'] as const,
  userEnrollments: (userId: string) => [...appQueryKeys.enrollments(), userId] as const,
  learningPaths: () => [...appQueryKeys.all, 'learningPaths'] as const,
  nextChallenge: (userId: string) => [...appQueryKeys.all, 'nextChallenge', userId] as const,
};

// Challenges Hook - Get challenges by path slug
export function useChallengesByPath(pathSlug: string) {
  return useQuery({
    queryKey: appQueryKeys.challengesByPath(pathSlug),
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await supabase
        .from('challenges_new')
        .select(`
          *,
          path:learning_paths(id, name, slug)
        `)
        .eq('path.slug', pathSlug)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!pathSlug,
  });
}

// Single Challenge Hook
export function useChallenge(challengeId: string) {
  return useQuery({
    queryKey: appQueryKeys.challenge(challengeId),
    queryFn: async (): Promise<Challenge | null> => {
      const { data, error } = await supabase
        .from('challenges_new')
        .select(`
          *,
          path:learning_paths(id, name, slug)
        `)
        .eq('legacy_id', challengeId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    },
    enabled: !!challengeId,
  });
}

// User Challenge Completions Hook
export function useUserCompletions(userId: string) {
  return useQuery({
    queryKey: appQueryKeys.userCompletions(userId),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('challenge_completions_new')
        .select(`
          challenge:challenges_new(legacy_id)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(item => item.challenge?.legacy_id).filter(Boolean) || [];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// User Path Enrollments Hook
export function useUserEnrollments(userId: string) {
  return useQuery({
    queryKey: appQueryKeys.userEnrollments(userId),
    queryFn: async (): Promise<UserPathEnrollment[]> => {
      const { data, error } = await supabase
        .from('user_path_enrollments_new')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

// Learning Paths Hook
export function useLearningPaths() {
  return useQuery({
    queryKey: appQueryKeys.learningPaths(),
    queryFn: async (): Promise<LearningPath[]> => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          category:path_categories(id, name, slug)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Next Challenge Hook
export function useNextChallenge(userId: string) {
  return useQuery({
    queryKey: appQueryKeys.nextChallenge(userId),
    queryFn: async () => {
      if (!userId) return { hasNextChallenge: false };

      // Get user's enrolled paths
      const { data: enrollments } = await supabase
        .from('user_path_enrollments_new')
        .select(`
          path_id,
          path:learning_paths(id, slug, name)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!enrollments || enrollments.length === 0) {
        return { hasNextChallenge: false, message: "No learning paths enrolled" };
      }

      // Get completed challenges
      const { data: completions } = await supabase
        .from('challenge_completions_new')
        .select('challenge_id')
        .eq('user_id', userId);

      const completedChallengeIds = new Set(completions?.map(c => c.challenge_id) || []);

      // Find next incomplete challenge
      for (const enrollment of enrollments) {
        const { data: challenges } = await supabase
          .from('challenges_new')
          .select('id, legacy_id, title, description, order_index')
          .eq('path_id', enrollment.path_id)
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        const nextChallenge = challenges?.find(c => !completedChallengeIds.has(c.id));

        if (nextChallenge) {
          return {
            hasNextChallenge: true,
            pathId: enrollment.path?.slug,
            challengeIndex: nextChallenge.order_index,
            challenge: {
              id: nextChallenge.legacy_id,
              title: nextChallenge.title,
              description: nextChallenge.description
            }
          };
        }
      }

      return { hasNextChallenge: false, message: "All challenges completed!" };
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Mutation: Complete Challenge
export function useCompleteChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, challengeId, code }: { userId: string; challengeId: string; code: string }) => {
      // First get the challenge UUID from legacy_id
      const { data: challenge } = await supabase
        .from('challenges_new')
        .select('id')
        .eq('legacy_id', challengeId)
        .single();

      if (!challenge) throw new Error('Challenge not found');

      // Insert completion
      const { data, error } = await supabase
        .from('challenge_completions_new')
        .insert({
          user_id: userId,
          challenge_id: challenge.id,
          submitted_code: code,
          completed_at: new Date().toISOString(),
          completion_data: {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: appQueryKeys.userCompletions(userId) });
      queryClient.invalidateQueries({ queryKey: appQueryKeys.nextChallenge(userId) });
    },
  });
}

// Challenges by enrolled paths Hook
export function useChallengesByEnrolledPaths(userId: string) {
  return useQuery({
    queryKey: [...appQueryKeys.all, 'challengesByEnrolledPaths', userId],
    queryFn: async () => {
      if (!userId) return [];

      // First get user's enrolled paths
      const { data: enrollments } = await supabase
        .from('user_path_enrollments_new')
        .select('path_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!enrollments || enrollments.length === 0) return [];

      const pathIds = enrollments.map(e => e.path_id);

      // Then get challenges for those paths
      const { data: challenges, error } = await supabase
        .from('challenges_new')
        .select(`
          *,
          path:learning_paths(id, name, slug)
        `)
        .in('path_id', pathIds)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return challenges || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation: Enroll in Path
export function useEnrollInPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, pathId }: { userId: string; pathId: string }) => {
      const { data, error } = await supabase
        .from('user_path_enrollments_new')
        .insert({
          user_id: userId,
          path_id: pathId,
          enrolled_at: new Date().toISOString(),
          is_active: true,
          progress_data: {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: appQueryKeys.userEnrollments(userId) });
      queryClient.invalidateQueries({ queryKey: appQueryKeys.nextChallenge(userId) });
      queryClient.invalidateQueries({ queryKey: [...appQueryKeys.all, 'challengesByEnrolledPaths', userId] });
    },
  });
}

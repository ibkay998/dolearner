import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminQueryKeys } from '@/lib/react-query';

// Types
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

interface PathCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TestCase {
  id: string;
  challenge_id: string;
  test_type: string;
  description: string;
  test_code: string;
  expected_result: any;
  test_config: any;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  challenge?: Challenge;
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

interface AdminStats {
  totalUsers: number;
  totalPaths: number;
  totalChallenges: number;
  totalCompletions: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalCompletions: number;
  averageCompletionRate: number;
}

// Admin Stats Hook
export function useAdminStats() {
  return useQuery({
    queryKey: adminQueryKeys.stats(),
    queryFn: async (): Promise<AdminStats> => {
      const [pathsResult, challengesResult, completionsResult] = await Promise.all([
        supabase.from('learning_paths').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('challenges_new').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('challenge_completions_new').select('*', { count: 'exact', head: true })
      ]);

      // Get total users count from auth.users (all registered users)
      const { count: totalUsers } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        totalPaths: pathsResult.count || 0,
        totalChallenges: challengesResult.count || 0,
        totalCompletions: completionsResult.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Challenges Hook
export function useChallenges() {
  return useQuery({
    queryKey: adminQueryKeys.challenges(),
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await supabase
        .from('challenges_new')
        .select(`
          *,
          path:learning_paths(id, name, slug)
        `)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Learning Paths Hook
export function useLearningPaths() {
  return useQuery({
    queryKey: adminQueryKeys.learningPaths(),
    queryFn: async (): Promise<LearningPath[]> => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          category:path_categories(id, name, slug)
        `)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Path Categories Hook
export function usePathCategories() {
  return useQuery({
    queryKey: adminQueryKeys.pathCategories(),
    queryFn: async (): Promise<PathCategory[]> => {
      const { data, error } = await supabase
        .from('path_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Test Cases Hook
export function useTestCases() {
  return useQuery({
    queryKey: adminQueryKeys.testCases(),
    queryFn: async (): Promise<TestCase[]> => {
      const { data, error } = await supabase
        .from('challenge_tests_new')
        .select(`
          *,
          challenge:challenges_new(
            id,
            legacy_id,
            title,
            path:learning_paths(name, slug)
          )
        `)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// User Analytics Hook
export function useUserStats() {
  return useQuery({
    queryKey: adminQueryKeys.userStats(),
    queryFn: async (): Promise<UserStats> => {
      try {
        // Get total users count from auth.users (all registered users)
        const { count: totalUsers } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true });

        // Get users who completed challenges in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: activeUsersData } = await supabase
          .from('challenge_completions_new')
          .select('user_id')
          .gte('completed_at', thirtyDaysAgo.toISOString());

        const activeUsers = new Set(activeUsersData?.map(u => u.user_id) || []).size;

        // Get total completions
        const { count: totalCompletions } = await supabase
          .from('challenge_completions_new')
          .select('*', { count: 'exact', head: true });

        // Get new users this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count: newUsersThisWeek } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo.toISOString());

        return {
          totalUsers: totalUsers || 0,
          activeUsers,
          newUsersThisWeek: newUsersThisWeek || 0,
          totalCompletions: totalCompletions || 0,
          averageCompletionRate: totalUsers ? ((totalCompletions || 0) / (totalUsers || 1)) * 100 : 0
        };
      } catch (error) {
        console.error('Error loading user stats:', error);
        return {
          totalUsers: 0,
          activeUsers: 0,
          newUsersThisWeek: 0,
          totalCompletions: 0,
          averageCompletionRate: 0
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutation hooks for creating/updating data
export function useCreateChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeData: Partial<Challenge>) => {
      const { data, error } = await supabase
        .from('challenges_new')
        .insert(challengeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.challenges() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...challengeData }: Partial<Challenge> & { id: string }) => {
      const { data, error } = await supabase
        .from('challenges_new')
        .update(challengeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.challenges() });
    },
  });
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('challenges_new')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.challenges() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

// Test Case mutation hooks
export function useCreateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testCaseData: Partial<TestCase>) => {
      const { data, error } = await supabase
        .from('challenge_tests_new')
        .insert(testCaseData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.testCases() });
    },
  });
}

export function useUpdateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...testCaseData }: Partial<TestCase> & { id: string }) => {
      const { data, error } = await supabase
        .from('challenge_tests_new')
        .update(testCaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.testCases() });
    },
  });
}

export function useDeleteTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('challenge_tests_new')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.testCases() });
    },
  });
}

// Path Category mutation hooks
export function useCreatePathCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: Partial<PathCategory>) => {
      const { data, error } = await supabase
        .from('path_categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pathCategories() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useUpdatePathCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<PathCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('path_categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pathCategories() });
    },
  });
}

export function useDeletePathCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('path_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pathCategories() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

// Learning Path mutation hooks
export function useCreateLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pathData: Partial<LearningPath>) => {
      const { data, error } = await supabase
        .from('learning_paths')
        .insert(pathData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.learningPaths() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useUpdateLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...pathData }: Partial<LearningPath> & { id: string }) => {
      const { data, error } = await supabase
        .from('learning_paths')
        .update({
          ...pathData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.learningPaths() });
    },
  });
}

export function useDeleteLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.learningPaths() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

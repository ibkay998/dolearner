"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { supabase } from "@/lib/supabase";

export interface UserPathEnrollment {
  id: string;
  user_id: string;
  path_id: string;
  enrolled_at: string;
  is_active: boolean;
}

export function useUserPathEnrollments() {
  const { user } = useSupabaseAuth();
  const [enrollments, setEnrollments] = useState<UserPathEnrollment[]>([]);
  const [enrolledPathIds, setEnrolledPathIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh enrollments
  const refreshEnrollments = useCallback(async () => {
    if (!user) {
      setEnrollments([]);
      setEnrolledPathIds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_path_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const enrollmentData = data || [];
      setEnrollments(enrollmentData);
      setEnrolledPathIds(enrollmentData.map(e => e.path_id));
    } catch (err) {
      console.error('Error loading path enrollments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load user's path enrollments
  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  // Check if user is enrolled in a specific path
  const isEnrolledInPath = (pathId: string): boolean => {
    return enrolledPathIds.includes(pathId);
  };

  // Enroll user in a path
  const enrollInPath = async (pathId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_path_enrollments')
        .insert({
          user_id: user.id,
          path_id: pathId
        });

      if (error) {
        throw error;
      }

      // Refresh enrollments after successful insertion
      await refreshEnrollments();

      return true;
    } catch (err) {
      console.error('Error enrolling in path:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll in path');
      return false;
    }
  };

  // Enroll user in multiple paths
  const enrollInPaths = async (pathIds: string[]): Promise<boolean> => {
    if (!user || pathIds.length === 0) return false;

    try {
      const enrollmentData = pathIds.map(pathId => ({
        user_id: user.id,
        path_id: pathId
      }));

      const { error } = await supabase
        .from('user_path_enrollments')
        .insert(enrollmentData);

      if (error) {
        throw error;
      }

      // Refresh enrollments after successful insertion
      await refreshEnrollments();

      return true;
    } catch (err) {
      console.error('Error enrolling in paths:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll in paths');
      return false;
    }
  };

  // Unenroll from a path (set is_active to false)
  const unenrollFromPath = async (pathId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_path_enrollments')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('path_id', pathId);

      if (error) {
        throw error;
      }

      // Update local state
      setEnrollments(prev => prev.filter(e => e.path_id !== pathId));
      setEnrolledPathIds(prev => prev.filter(id => id !== pathId));

      return true;
    } catch (err) {
      console.error('Error unenrolling from path:', err);
      setError(err instanceof Error ? err.message : 'Failed to unenroll from path');
      return false;
    }
  };

  // Memoize computed values to prevent unnecessary re-renders
  const hasAnyEnrollments = useMemo(() => enrollments.length > 0, [enrollments.length]);
  const enrollmentCount = useMemo(() => enrollments.length, [enrollments.length]);

  return {
    enrollments,
    enrolledPathIds,
    loading,
    error,
    isEnrolledInPath,
    enrollInPath,
    enrollInPaths,
    unenrollFromPath,
    hasAnyEnrollments,
    enrollmentCount,
  };
}

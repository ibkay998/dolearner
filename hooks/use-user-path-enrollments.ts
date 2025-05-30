"use client";

import { useMemo } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useUserEnrollments, useEnrollInPath } from "./use-app-data";

export interface UserPathEnrollment {
  id: string;
  user_id: string;
  path_id: string;
  enrolled_at: string;
  is_active: boolean;
  progress_data: any;
}

export function useUserPathEnrollments() {
  const { user } = useSupabaseAuth();

  // Use React Query hook for fetching enrollments
  const { data: enrollments = [], isLoading: loading, error: queryError } = useUserEnrollments(user?.id || '');
  const enrollInPathMutation = useEnrollInPath();

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load enrollments') : null;

  // Compute enrolled path IDs
  const enrolledPathIds = useMemo(() =>
    enrollments.map(e => e.path_id),
    [enrollments]
  );

  // Check if user is enrolled in a specific path
  const isEnrolledInPath = (pathId: string): boolean => {
    return enrolledPathIds.includes(pathId);
  };

  // Enroll user in a path
  const enrollInPath = async (pathId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await enrollInPathMutation.mutateAsync({
        userId: user.id,
        pathId
      });
      return true;
    } catch (err) {
      console.error('Error enrolling in path:', err);
      return false;
    }
  };

  // Enroll user in multiple paths
  const enrollInPaths = async (pathIds: string[]): Promise<boolean> => {
    if (!user || pathIds.length === 0) return false;

    try {
      // Enroll in each path sequentially
      for (const pathId of pathIds) {
        await enrollInPathMutation.mutateAsync({
          userId: user.id,
          pathId
        });
      }
      return true;
    } catch (err) {
      console.error('Error enrolling in paths:', err);
      return false;
    }
  };

  // Note: Unenroll functionality would require a separate mutation hook
  // For now, we'll keep this simple and focus on enrollment
  const unenrollFromPath = async (pathId: string): Promise<boolean> => {
    console.warn('Unenroll functionality not yet implemented with new schema');
    return false;
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

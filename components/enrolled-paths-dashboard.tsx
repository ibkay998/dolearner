"use client";

import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useUserPathEnrollments } from "@/hooks/use-user-path-enrollments";
import { useCompletedChallengesSupabase } from "@/hooks/use-completed-challenges-supabase";
import { useLearningPaths, useChallengesByEnrolledPaths } from "@/hooks/use-app-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { CheckCircle2, Code, Palette, BookOpen, Plus, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useRouter } from "next/navigation";

interface EnrolledPathsDashboardProps {
  onAddPaths: () => void;
}

export function EnrolledPathsDashboard({ onAddPaths }: EnrolledPathsDashboardProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { enrollments, loading: enrollmentsLoading } = useUserPathEnrollments();
  const { completedChallenges, loading: completionsLoading } = useCompletedChallengesSupabase();
  const { data: learningPaths = [], isLoading: pathsLoading } = useLearningPaths();
  const { data: challenges = [], isLoading: challengesLoading } = useChallengesByEnrolledPaths(user?.id || '');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const loading = enrollmentsLoading || completionsLoading || pathsLoading || challengesLoading;

  if (loading) {
    return <Loading text="Loading your learning paths..." size="lg" className="py-8" />;
  }

  // If user has no enrollments, show enrollment prompt
  if (enrollments.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>No Learning Paths Selected</CardTitle>
          <CardDescription>
            Get started by selecting one or more learning paths to begin your journey!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onAddPaths} size="lg" className="px-8">
            <Plus className="h-5 w-5 mr-2" />
            Choose Learning Paths
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group challenges by path
  const challengesByPath = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.path_id]) {
      acc[challenge.path_id] = [];
    }
    acc[challenge.path_id].push(challenge);
    return acc;
  }, {} as Record<string, any[]>);

  // Get path info
  const getPathInfo = (pathId: string) => {
    return learningPaths.find(p => p.id === pathId);
  };

  // Get enrolled path IDs
  const enrolledPathIds = enrollments.map(e => e.path_id);

  // Map path IDs to their respective icons
  const pathIcons: Record<string, React.ReactNode> = {
    react: <Code className="h-5 w-5" />,
    css: <Palette className="h-5 w-5" />,
  };

  const handleContinuePath = (pathId: string) => {
    // Find the first incomplete challenge in this path
    const pathChallenges = challengesByPath[pathId] || [];
    const firstIncompleteIndex = pathChallenges.findIndex(
      (challenge: any) => !completedChallenges.includes(challenge.legacy_id)
    );

    // If all challenges are complete, go to the first challenge
    const challengeIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;

    // Get the path slug for navigation - ensure we use the correct slug
    const pathInfo = getPathInfo(pathId);
    const pathSlug = pathInfo?.slug;

    if (!pathSlug) {
      console.error(`No slug found for path ID: ${pathId}`);
      return;
    }

    router.push(`/challenges/${pathSlug}?challengeIndex=${challengeIndex}`);
  };

  const togglePathExpansion = (pathId: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pathId)) {
        newSet.delete(pathId);
      } else {
        newSet.add(pathId);
      }
      return newSet;
    });
  };

  const handleChallengeClick = (pathId: string, challengeIndex: number) => {
    const pathInfo = getPathInfo(pathId);
    const pathSlug = pathInfo?.slug;

    if (!pathSlug) {
      console.error(`No slug found for path ID: ${pathId}`);
      return;
    }

    router.push(`/challenges/${pathSlug}?challengeIndex=${challengeIndex}`);
  };

  // Map path slugs to color schemes
  const pathColors: Record<string, string> = {
    react: 'from-blue-600 to-indigo-600',
    css: 'from-purple-600 to-pink-600',
    dsa: 'from-green-600 to-emerald-600',
    backend: 'from-orange-600 to-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Learning Paths</h2>
        <Button variant="outline" onClick={onAddPaths}>
          <Plus className="h-4 w-4 mr-2" />
          Add Paths
        </Button>
      </div>

      <div className="grid gap-6">
        {enrolledPathIds.map(pathId => {
          const pathInfo = getPathInfo(pathId);
          const pathChallenges = challengesByPath[pathId] || [];
          const completedCount = pathChallenges.filter((challenge: any) =>
            completedChallenges.includes(challenge.legacy_id)
          ).length;
          const totalCount = pathChallenges.length;
          const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          if (!pathInfo) return null;

          const colorScheme = pathColors[pathInfo.slug] || pathColors.react;

          return (
            <Collapsible
              key={pathId}
              open={expandedPaths.has(pathId)}
              onOpenChange={() => togglePathExpansion(pathId)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className={`bg-gradient-to-r ${colorScheme} text-white cursor-pointer hover:opacity-90 transition-opacity`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                          {pathIcons[pathInfo.slug] || <Code className="h-5 w-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-white">{pathInfo.name} Path</CardTitle>
                          <CardDescription className="text-white/90">
                            {completedCount} of {totalCount} challenges completed ({completionPercentage}%)
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinuePath(pathId);
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                        {expandedPaths.has(pathId) ? (
                          <ChevronDown className="h-5 w-5 text-white" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-6">
                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${colorScheme} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* All challenges */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        All Challenges ({totalCount})
                      </h4>
                      <div className="space-y-2">
                        {pathChallenges.map((challenge: any, index: number) => {
                          const isCompleted = completedChallenges.includes(challenge.legacy_id);
                          return (
                            <div
                              key={challenge.id}
                              className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                                isCompleted
                                  ? 'bg-green-50 border border-green-100 hover:bg-green-100'
                                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                              }`}
                              onClick={() => handleChallengeClick(pathId, index)}
                            >
                              <CheckCircle2
                                className={`h-4 w-4 mr-3 ${
                                  isCompleted ? 'text-green-500' : 'text-gray-300'
                                }`}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{challenge.title}</p>
                                <p className="text-xs text-gray-500">
                                  {challenge.description.substring(0, 80)}...
                                </p>
                              </div>
                              <div className="text-xs text-gray-400">
                                #{index + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

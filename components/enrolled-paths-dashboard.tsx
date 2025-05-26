"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useUserPathEnrollments } from "@/hooks/use-user-path-enrollments";
import { useCompletedChallengesSupabase } from "@/hooks/use-completed-challenges-supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { CheckCircle2, Code, Palette, BookOpen, Plus, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Challenge } from "@/data/challenge-types";
import { learningPaths } from "@/data/learning-paths";
import { useRouter } from "next/navigation";

interface EnrolledPathsDashboardProps {
  onAddPaths: () => void;
}

export function EnrolledPathsDashboard({ onAddPaths }: EnrolledPathsDashboardProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { enrolledPathIds, loading: enrollmentsLoading } = useUserPathEnrollments();
  const { completedChallenges, loading: completionsLoading } = useCompletedChallengesSupabase();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Load challenges for enrolled paths
  useEffect(() => {
    const loadChallenges = async () => {
      if (!user || enrolledPathIds.length === 0) {
        setChallenges([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch challenges only for enrolled paths
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .in('path_id', enrolledPathIds)
          .order('order_num', { ascending: true });

        if (error) {
          console.error('Error loading challenges:', error);
          return;
        }

        // Convert to Challenge type
        const challengesData = data.map(item => ({
          id: item.id,
          pathId: item.path_id,
          title: item.title,
          description: item.description,
          initialCode: item.initial_code,
          solutionCode: item.solution_code,
          solutionMarker: item.solution_marker,
          order: item.order_num
        }));

        setChallenges(challengesData);
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, [user, enrolledPathIds]);

  if (enrollmentsLoading || completionsLoading || loading) {
    return <Loading text="Loading your learning paths..." size="lg" className="py-8" />;
  }

  // If user has no enrollments, show enrollment prompt
  if (enrolledPathIds.length === 0) {
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
    if (!acc[challenge.pathId]) {
      acc[challenge.pathId] = [];
    }
    acc[challenge.pathId].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>);

  // Get path info
  const getPathInfo = (pathId: string) => {
    return learningPaths.find(p => p.id === pathId);
  };

  // Map path IDs to their respective icons
  const pathIcons: Record<string, React.ReactNode> = {
    react: <Code className="h-5 w-5" />,
    css: <Palette className="h-5 w-5" />,
  };

  const handleContinuePath = (pathId: string) => {
    // Find the first incomplete challenge in this path
    const pathChallenges = challengesByPath[pathId] || [];
    const firstIncompleteIndex = pathChallenges.findIndex(
      challenge => !completedChallenges.includes(challenge.id)
    );
    
    // If all challenges are complete, go to the first challenge
    const challengeIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
    
    router.push(`/challenges/${pathId}?challengeIndex=${challengeIndex}`);
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
          const completedCount = pathChallenges.filter(challenge =>
            completedChallenges.includes(challenge.id)
          ).length;
          const totalCount = pathChallenges.length;
          const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          if (!pathInfo) return null;

          return (
            <Card key={pathId} className="overflow-hidden">
              <CardHeader className={`bg-gradient-to-r ${pathInfo.color} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg mr-3">
                      {pathIcons[pathId] || <Code className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-white">{pathInfo.title} Path</CardTitle>
                      <CardDescription className="text-white/90">
                        {completedCount} of {totalCount} challenges completed ({completionPercentage}%)
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleContinuePath(pathId)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${pathInfo.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Recent challenges */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Recent Challenges
                  </h4>
                  <div className="space-y-2">
                    {pathChallenges.slice(0, 3).map(challenge => {
                      const isCompleted = completedChallenges.includes(challenge.id);
                      return (
                        <div
                          key={challenge.id}
                          className={`flex items-center p-3 rounded-md ${
                            isCompleted
                              ? 'bg-green-50 border border-green-100'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 mr-3 ${
                              isCompleted ? 'text-green-500' : 'text-gray-300'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{challenge.title}</p>
                            <p className="text-xs text-gray-500">
                              {challenge.description.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {pathChallenges.length > 3 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        +{pathChallenges.length - 3} more challenges
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

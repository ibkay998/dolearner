"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Palette, CheckCircle, BookOpen, Award, Plus, X, Brain } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { useLearningPaths, useChallengesByEnrolledPaths } from "@/hooks/use-app-data";
import { useUserPathEnrollments } from "@/hooks/use-user-path-enrollments";
import { useEnrollInPath } from "@/hooks/use-app-data";

interface PathEnrollmentSelectionProps {
  onEnrollmentComplete: () => void;
  isInitialSetup?: boolean; // Whether this is for new user setup or adding paths
}

export function PathEnrollmentSelection({
  onEnrollmentComplete,
  isInitialSetup = false
}: PathEnrollmentSelectionProps) {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  // Use React Query hooks
  const { data: learningPaths = [], isLoading: pathsLoading } = useLearningPaths();
  const { enrollments, loading: enrollmentsLoading } = useUserPathEnrollments();
  const { data: challenges = [], isLoading: challengesLoading } = useChallengesByEnrolledPaths(user?.id || '');
  const enrollInPathMutation = useEnrollInPath();

  const isLoading = pathsLoading || enrollmentsLoading || challengesLoading;
  const enrolledPathIds = enrollments.map(e => e.path_id);

  // Calculate challenge counts per path
  const pathChallenges = challenges.reduce((acc, challenge) => {
    const pathId = challenge.path_id;
    acc[pathId] = (acc[pathId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handlePathToggle = (pathId: string) => {
    if (enrolledPathIds.includes(pathId)) {
      // Can't deselect already enrolled paths in this component
      return;
    }

    setSelectedPaths(prev =>
      prev.includes(pathId)
        ? prev.filter(id => id !== pathId)
        : [...prev, pathId]
    );
  };

  const handleEnroll = async () => {
    if (!user || selectedPaths.length === 0) return;

    try {
      // Enroll in each selected path
      for (const pathId of selectedPaths) {
        await enrollInPathMutation.mutateAsync({
          userId: user.id,
          pathId
        });
      }

      toast({
        title: "Successfully enrolled!",
        description: `You've been enrolled in ${selectedPaths.length} learning path${selectedPaths.length > 1 ? 's' : ''}.`,
      });

      // Reset selected paths
      setSelectedPaths([]);
      onEnrollmentComplete();
    } catch (error) {
      console.error('Error enrolling in paths:', error);
      toast({
        title: "Enrollment failed",
        description: "There was an error enrolling you in the selected paths. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Map path IDs to their respective icons
  const pathIcons: Record<string, React.ReactNode> = {
    react: <Code className="h-6 w-6" />,
    css: <Palette className="h-6 w-6" />,
    dsa: <Brain className="h-6 w-6" />,
  };

  if (isLoading) {
    return <Loading text="Loading learning paths..." size="lg" className="py-8" />;
  }

  // Filter paths to show only those not already enrolled (for adding new paths)
  const availablePaths = isInitialSetup
    ? learningPaths
    : learningPaths.filter(path => !enrolledPathIds.includes(path.id));

  if (!isInitialSetup && availablePaths.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>All Paths Enrolled</CardTitle>
          <CardDescription>
            You're already enrolled in all available learning paths!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          {isInitialSetup ? "Choose Your Learning Paths" : "Add Learning Paths"}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isInitialSetup
            ? "Select one or more learning paths to get started. You can always add more paths later from your profile."
            : "Select additional learning paths to expand your learning journey."
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {availablePaths.map((path) => {
          const isEnrolled = enrolledPathIds.includes(path.id);
          const isSelected = selectedPaths.includes(path.id);
          const isSelectable = !isEnrolled;

          // Map path slugs to color schemes
          const pathColors: Record<string, string> = {
            react: 'from-blue-600 to-indigo-600',
            css: 'from-purple-600 to-pink-600',
            dsa: 'from-green-600 to-emerald-600',
            backend: 'from-orange-600 to-red-600',
          };

          const colorScheme = pathColors[path.slug] || pathColors.react;

          return (
            <Card
              key={path.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? "border-2 border-blue-500 bg-blue-50 shadow-md"
                  : isEnrolled
                  ? "border-2 border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${!isSelectable ? "opacity-75" : ""}`}
              onClick={() => isSelectable && handlePathToggle(path.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorScheme} text-white mr-4 shadow-md`}>
                      {pathIcons[path.slug] || <Code className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{path.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <BookOpen className="h-4 w-4 mr-1" />
                        <span>{pathChallenges[path.id] || 0} challenges</span>
                      </div>
                    </div>
                  </div>
                  {isEnrolled && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 leading-relaxed">
                  {path.description}
                </CardDescription>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{path.difficulty_level || 'Beginner'} friendly</span>
                  </div>
                  {isEnrolled ? (
                    <span className="text-sm font-medium text-green-600">Enrolled</span>
                  ) : (
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePathToggle(path.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Selected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" /> Select
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPaths.length > 0 && (
        <div className="text-center">
          <Button
            onClick={handleEnroll}
            disabled={enrollInPathMutation.isPending}
            size="lg"
            className="px-8"
          >
            {enrollInPathMutation.isPending ? (
              <>
                <Loading size="sm" className="mr-2" />
                Enrolling...
              </>
            ) : (
              <>
                Enroll in {selectedPaths.length} Path{selectedPaths.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {isInitialSetup && selectedPaths.length === 0 && (
        <div className="text-center text-gray-500">
          <p>Select at least one learning path to continue</p>
        </div>
      )}
    </div>
  );
}

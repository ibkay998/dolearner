"use client";

import { useState, useEffect } from "react";
import { LearningPath, learningPaths } from "@/data/learning-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Palette, CheckCircle, BookOpen, Award, Plus, X } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

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
  const [enrolledPaths, setEnrolledPaths] = useState<string[]>([]);
  const [pathChallenges, setPathChallenges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Load existing enrollments and challenge counts
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Load existing enrollments
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('user_path_enrollments')
          .select('path_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (enrollmentError) {
          console.error('Error loading enrollments:', enrollmentError);
        } else {
          const enrolled = enrollments?.map(e => e.path_id) || [];
          setEnrolledPaths(enrolled);
        }

        // Load challenge counts for each path
        const counts: Record<string, number> = {};
        for (const path of learningPaths) {
          const { data: challenges, error } = await supabase
            .from('challenges')
            .select('id')
            .eq('path_id', path.id);

          if (!error) {
            counts[path.id] = challenges?.length || 0;
          }
        }
        setPathChallenges(counts);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handlePathToggle = (pathId: string) => {
    if (enrolledPaths.includes(pathId)) {
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

    setIsEnrolling(true);
    try {
      // Insert new enrollments
      const enrollments = selectedPaths.map(pathId => ({
        user_id: user.id,
        path_id: pathId
      }));

      const { error } = await supabase
        .from('user_path_enrollments')
        .insert(enrollments);

      if (error) {
        throw error;
      }

      toast({
        title: "Successfully enrolled!",
        description: `You've been enrolled in ${selectedPaths.length} learning path${selectedPaths.length > 1 ? 's' : ''}.`,
      });

      // Reset selected paths
      setSelectedPaths([]);

      // Small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh enrolled paths
      const { data: newEnrollments, error: refreshError } = await supabase
        .from('user_path_enrollments')
        .select('path_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!refreshError && newEnrollments) {
        setEnrolledPaths(newEnrollments.map(e => e.path_id));
      }

      onEnrollmentComplete();
    } catch (error) {
      console.error('Error enrolling in paths:', error);
      toast({
        title: "Enrollment failed",
        description: "There was an error enrolling you in the selected paths. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Map path IDs to their respective icons
  const pathIcons: Record<string, React.ReactNode> = {
    react: <Code className="h-6 w-6" />,
    css: <Palette className="h-6 w-6" />,
  };

  if (isLoading) {
    return <Loading text="Loading learning paths..." size="lg" className="py-8" />;
  }

  // Filter paths to show only those not already enrolled (for adding new paths)
  const availablePaths = isInitialSetup
    ? learningPaths
    : learningPaths.filter(path => !enrolledPaths.includes(path.id));

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
          const isEnrolled = enrolledPaths.includes(path.id);
          const isSelected = selectedPaths.includes(path.id);
          const isSelectable = !isEnrolled;

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
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${path.color} text-white mr-4 shadow-md`}>
                      {pathIcons[path.id] || <Code className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{path.title}</CardTitle>
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
                    <span>Beginner friendly</span>
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
            disabled={isEnrolling}
            size="lg"
            className="px-8"
          >
            {isEnrolling ? (
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

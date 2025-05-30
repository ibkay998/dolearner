"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ComponentChallenge } from "@/components/component-challenge";
import { learningPaths } from "@/data/learning-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Plus } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useUserPathEnrollments } from "@/hooks/use-user-path-enrollments";
import { useLearningPaths } from "@/hooks/use-app-data";
import { Loading } from "@/components/ui/loading";

interface ChallengePageProps {
  params: Promise<{
    pathId: string;
  }>;
}

// Component that handles search params and needs Suspense
function ChallengePageContent({ pathId }: { pathId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSupabaseAuth();
  const { isEnrolledInPath, loading: enrollmentLoading } = useUserPathEnrollments();
  const { data: dbLearningPaths = [], isLoading: pathsLoading } = useLearningPaths();
  const [initialChallengeIndex, setInitialChallengeIndex] = useState<number>(0);

  // Handle URL parameters for direct navigation to specific challenges
  useEffect(() => {
    const challengeIndexParam = searchParams.get('challengeIndex');

    if (challengeIndexParam) {
      const index = parseInt(challengeIndexParam, 10);
      if (!isNaN(index) && index >= 0) {
        setInitialChallengeIndex(index);
      }
    }
  }, [searchParams]);

  // Get the selected path details for the header
  const selectedPath = learningPaths.find(path => path.id === pathId);

  const handleBackToPathSelection = () => {
    router.push('/');
  };

  // If path doesn't exist, redirect to home
  if (!selectedPath) {
    router.push('/');
    return null;
  }

  // Show loading while checking enrollment or paths
  if (enrollmentLoading || pathsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading text="Checking access..." size="lg" />
      </div>
    );
  }

  // Find the database path that matches the URL slug
  const dbPath = dbLearningPaths.find(path => path.slug === pathId);

  // Check if user is enrolled in this path (only for authenticated users)
  // Use the database path UUID for enrollment checking
  const isEnrolled = user && dbPath ? isEnrolledInPath(dbPath.id) : true; // Allow unauthenticated access for now

  return (
    <>
      {user && !isEnrolled ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <CardTitle>Path Not Enrolled</CardTitle>
              <CardDescription>
                You need to enroll in the {selectedPath.title} learning path to access these challenges.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button
                onClick={() => router.push('/profile')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enroll in Learning Path
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToPathSelection}
                className="w-full"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ComponentChallenge
          pathId={pathId}
          onBackToPathSelection={handleBackToPathSelection}
          initialChallengeIndex={initialChallengeIndex}
        />
      )}
    </>
  );
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { pathId } = use(params);

  // Get the selected path details for the header
  const selectedPath = learningPaths.find(path => path.id === pathId);

  // If path doesn't exist, redirect to home
  if (!selectedPath) {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: {selectedPath.title} Practice
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(user ? '/profile' : '/auth')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            {user ? "My Profile" : "Sign In"}
          </Button>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading challenges..." />
        </div>
      }>
        <ChallengePageContent pathId={pathId} />
      </Suspense>
    </main>
  );
}

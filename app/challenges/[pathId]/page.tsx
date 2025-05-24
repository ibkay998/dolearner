"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ComponentChallenge } from "@/components/component-challenge";
import { learningPaths } from "@/data/learning-paths";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

interface ChallengePageProps {
  params: Promise<{
    pathId: string;
  }>;
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSupabaseAuth();
  const { pathId } = use(params);
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

      <ComponentChallenge
        pathId={pathId}
        onBackToPathSelection={handleBackToPathSelection}
        initialChallengeIndex={initialChallengeIndex}
      />
    </main>
  );
}

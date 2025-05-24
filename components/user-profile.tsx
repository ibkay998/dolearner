"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { useCompletedChallengesSupabase } from "@/hooks/use-completed-challenges-supabase";
import { useNextChallenge } from "@/hooks/use-next-challenge";
import { Trophy, ArrowRight, BookOpen } from "lucide-react";

export function UserProfile() {
  const router = useRouter();
  const { user, signOut } = useSupabaseAuth();
  const { completedChallenges, loading } = useCompletedChallengesSupabase();
  const { nextChallenge, loading: nextChallengeLoading } = useNextChallenge();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  const handleContinueLearning = () => {
    if (nextChallengeLoading) {
      return; // Don't navigate while loading
    }

    console.log('Continue Learning clicked:', { nextChallenge, nextChallengeLoading, user });

    if (!nextChallenge) {
      // Fallback to first React challenge if no next challenge data
      console.log('No next challenge data, navigating to first React challenge');
      router.push('/challenges/react?challengeIndex=0');
      return;
    }

    if (!nextChallenge.hasNextChallenge) {
      // All challenges completed - still navigate to challenges but show first one
      toast({
        title: "Congratulations!",
        description: nextChallenge.message || "You've completed all challenges!",
        variant: "default",
      });
      console.log('All challenges completed, navigating to first React challenge');
      router.push('/challenges/react?challengeIndex=0');
      return;
    }

    // Navigate to the specific challenge
    const challengeIndex = nextChallenge.challengeIndex!.toString();
    const targetUrl = `/challenges/${nextChallenge.pathId}?challengeIndex=${challengeIndex}`;
    console.log('Navigating to next challenge:', targetUrl);
    router.push(targetUrl);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          You're signed in as {user.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium">Your Progress</h3>
              {loading ? (
                <Loading size="sm" className="py-2" />
              ) : (
                <div className="mt-1">
                  <p className="text-3xl font-bold">{completedChallenges.length}</p>
                  <p className="text-sm text-gray-600">challenges completed</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleContinueLearning}
          disabled={nextChallengeLoading}
        >
          {nextChallengeLoading ? (
            <>
              <Loading size="sm" className="mr-2" />
              Finding Next Challenge...
            </>
          ) : nextChallenge?.hasNextChallenge ? (
            <>
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : nextChallenge?.hasNextChallenge === false ? (
            <>
              View All Challenges
              <BookOpen className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? <Loading text="Signing out..." size="sm" /> : "Sign Out"}
        </Button>
      </CardFooter>
    </Card>
  );
}

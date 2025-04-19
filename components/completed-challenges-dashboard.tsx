"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useCompletedChallengesSupabase } from "@/hooks/use-completed-challenges-supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Challenge } from "@/data/challenge-types";

export function CompletedChallengesDashboard() {
  const { user } = useSupabaseAuth();
  const { completedChallenges, loading: loadingCompletions } = useCompletedChallengesSupabase();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all challenges from Supabase
  useEffect(() => {
    const loadChallenges = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch challenges from Supabase
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
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
  }, [user]);

  if (loading || loadingCompletions) {
    return <Loading text="Loading challenges..." size="lg" className="py-8" />;
  }

  // Group challenges by path
  const challengesByPath = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.pathId]) {
      acc[challenge.pathId] = [];
    }
    acc[challenge.pathId].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>);

  // Get path names
  const pathNames: Record<string, string> = {
    'react': 'React',
    'css': 'CSS',
    // Add more paths as needed
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Completed Challenges</h2>

      {Object.keys(challengesByPath).length === 0 ? (
        <p className="text-gray-500">No challenges found.</p>
      ) : (
        Object.entries(challengesByPath).map(([pathId, pathChallenges]) => (
          <Card key={pathId} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle>{pathNames[pathId] || pathId} Path</CardTitle>
              <CardDescription>
                {completedChallenges.filter(id =>
                  pathChallenges.some(c => c.id === id)
                ).length} of {pathChallenges.length} challenges completed
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {pathChallenges.map(challenge => {
                  const isCompleted = completedChallenges.includes(challenge.id);
                  return (
                    <li
                      key={challenge.id}
                      className={`flex items-center p-3 rounded-md ${
                        isCompleted
                          ? 'bg-green-50 border border-green-100'
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <CheckCircle2
                        className={`h-5 w-5 mr-3 ${
                          isCompleted ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{challenge.title}</p>
                        <p className="text-sm text-gray-500">{challenge.description.substring(0, 60)}...</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

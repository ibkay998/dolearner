"use client";

import { useState, useEffect } from "react";
import { useCompletedChallenges } from "@/hooks/use-completed-challenges";
import { Challenge } from "@/data/challenge-types";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletedChallengesSummaryProps {
  challenges: Challenge[];
  onSelectChallenge: (index: number) => void;
}

export function CompletedChallengesSummary({
  challenges,
  onSelectChallenge
}: CompletedChallengesSummaryProps) {
  const { completedChallenges } = useCompletedChallenges();
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (challenges.length > 0) {
      // Count how many of the current path's challenges are completed
      const completedCount = challenges.filter(challenge =>
        completedChallenges.includes(challenge.id)
      ).length;

      const percentage = (completedCount / challenges.length) * 100;
      setCompletionPercentage(Math.round(percentage));
    }
  }, [completedChallenges, challenges]);

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      <h3 className="text-xl font-semibold mb-4">Your Progress</h3>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Completion</span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Challenges:</h4>
        {challenges.map((challenge, index) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          return (
            <div
              key={challenge.id}
              className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelectChallenge(index)}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium">{challenge.title}</span>
              </div>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {completionPercentage === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-green-800 font-medium">
            Congratulations! You've completed all challenges in this path.
          </p>
        </div>
      )}
    </div>
  );
}

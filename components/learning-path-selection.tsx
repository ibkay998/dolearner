"use client";

import { useState, useEffect } from "react";
import { LearningPath, learningPaths } from "@/data/learning-paths";
import { Button } from "@/components/ui/button";
import { Code, Palette, BookOpen, Brain, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LearningPathSelectionProps {
  onSelectPath: (pathId: string) => void;
}

export function LearningPathSelection({ onSelectPath }: LearningPathSelectionProps) {
  const [pathChallenges, setPathChallenges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load challenge counts for each path from database
  useEffect(() => {
    const loadChallengeCounts = async () => {
      setIsLoading(true);
      const counts: Record<string, number> = {};

      for (const path of learningPaths) {
        try {
          const { data, error } = await supabase
            .from('challenges_new')
            .select('id', { count: 'exact' })
            .eq('path.slug', path.id)
            .eq('is_active', true);

          if (error) {
            console.error(`Error fetching challenges for ${path.id}:`, error);
            counts[path.id] = 0;
          } else {
            counts[path.id] = data?.length || 0;
          }
        } catch (err) {
          console.error(`Error fetching challenges for ${path.id}:`, err);
          counts[path.id] = 0;
        }
      }

      setPathChallenges(counts);
      setIsLoading(false);
    };

    loadChallengeCounts();
  }, []);

  // Map path IDs to their respective icons
  const pathIcons: Record<string, React.ReactNode> = {
    react: <Code className="h-5 w-5" />,
    css: <Palette className="h-5 w-5" />,
    dsa: <Brain className="h-5 w-5" />,
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Choose Your Learning Path</h2>
        <p className="text-gray-600 max-w-xl mx-auto text-sm">Start building your skills through interactive challenges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className="border rounded-lg p-4 transition-all hover:shadow-md hover:border-gray-300 bg-white"
          >
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${path.color} text-white mr-3`}>
                {pathIcons[path.id] || <Code className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{path.title}</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span>{isLoading ? "..." : `${pathChallenges[path.id] || 0} challenges`}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{path.description}</p>
            <Button
              onClick={() => onSelectPath(path.id)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Learning
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">All paths are beginner-friendly and include step-by-step guidance</p>
      </div>
    </div>
  );
}

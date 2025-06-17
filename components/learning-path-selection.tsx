"use client";

import { useState, useEffect } from "react";
import { learningPaths } from "@/data/learning-paths";
import { Button } from "@/components/ui/button";
import { Code, Palette, ArrowRight, CheckCircle, BookOpen, Award, Brain } from "lucide-react";
import { useLearningPaths } from "@/hooks/use-app-data";
import { supabase } from "@/lib/supabase";

interface LearningPathSelectionProps {
  onSelectPath: (pathId: string) => void;
}

export function LearningPathSelection({ onSelectPath }: LearningPathSelectionProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pathChallenges, setPathChallenges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get learning paths from database
  const { data: dbLearningPaths = [], isLoading: pathsLoading } = useLearningPaths();

  // Load challenge counts for each path from database
  useEffect(() => {
    const loadChallengeCounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const counts: Record<string, number> = {};

        // Get challenge counts for each path from database
        for (const path of learningPaths) {
          // Find corresponding database path
          const dbPath = dbLearningPaths.find(dbP => dbP.slug === path.id);

          if (dbPath) {
            const { data, error: countError } = await supabase
              .from('challenges_new')
              .select('id', { count: 'exact' })
              .eq('path_id', dbPath.id)
              .eq('is_active', true);

            if (countError) {
              throw new Error(`Failed to load challenges for ${path.title}: ${countError.message}`);
            }

            counts[path.id] = data?.length || 0;
          } else {
            // Fallback to static data if database path not found
            counts[path.id] = 0;
          }
        }

        setPathChallenges(counts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load challenge counts';
        setError(errorMessage);

        // Fallback to showing 0 challenges for all paths
        const fallbackCounts: Record<string, number> = {};
        learningPaths.forEach(path => {
          fallbackCounts[path.id] = 0;
        });
        setPathChallenges(fallbackCounts);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load counts when database paths are available
    if (!pathsLoading && dbLearningPaths.length > 0) {
      loadChallengeCounts();
    }
  }, [dbLearningPaths, pathsLoading]);

  const handlePathSelect = (pathId: string) => {
    setSelectedPath(pathId);
  };

  const handleContinue = () => {
    if (selectedPath) {
      onSelectPath(selectedPath);
    }
  };

  // Map path IDs to their respective icons
  const pathIcons: Record<string, React.ReactNode> = {
    react: <Code className="h-6 w-6" />,
    css: <Palette className="h-6 w-6" />,
    dsa: <Brain className="h-6 w-6" />,
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Choose Your Learning Path</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Select a learning path to start building your skills through interactive challenges. Each path focuses on different aspects of web development.</p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <p>⚠️ {error}</p>
            <p className="mt-1 text-xs">Challenge counts may not be accurate. Please try refreshing the page.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className={`border rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedPath === path.id
                ? "border-2 border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handlePathSelect(path.id)}
          >
            <div className="flex items-center mb-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${path.color} text-white mr-4 shadow-md`}>
                {pathIcons[path.id] || <Code className="h-7 w-7" />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{path.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>
                    {isLoading || pathsLoading ? (
                      "Loading..."
                    ) : (
                      `${pathChallenges[path.id] || 0} challenges`
                    )}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{path.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                <Award className="h-4 w-4 mr-1" />
                <span>Beginner friendly</span>
              </div>
              <Button
                variant={selectedPath === path.id ? "default" : "outline"}
                size="sm"
                className={selectedPath === path.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePathSelect(path.id);
                }}
              >
                {selectedPath === path.id ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" /> Selected
                  </>
                ) : "Select"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedPath}
          className={`px-8 py-6 text-lg transition-all ${!selectedPath ? "opacity-50" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"}`}
        >
          Continue to Challenges
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComponentChallenge } from "@/components/component-challenge";
import { LearningPathSelection } from "@/components/learning-path-selection";
import { learningPaths } from "@/data/learning-paths";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export default function Home() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  // Get the selected path details for the header
  const selectedPath = selectedPathId
    ? learningPaths.find(path => path.id === selectedPathId)
    : null;

  const handleSelectPath = (pathId: string) => {
    setSelectedPathId(pathId);
  };

  const handleBackToPathSelection = () => {
    setSelectedPathId(null);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: {selectedPath ? `${selectedPath.title} Practice` : "Learning Platform"}
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

      {selectedPathId ? (
        <ComponentChallenge
          pathId={selectedPathId}
          onBackToPathSelection={handleBackToPathSelection}
        />
      ) : (
        <LearningPathSelection onSelectPath={handleSelectPath} />
      )}
    </main>
  );
}


"use client";

import { useState } from "react";
import { ComponentChallenge } from "@/components/component-challenge";
import { LearningPathSelection } from "@/components/learning-path-selection";
import { learningPaths } from "@/data/learning-paths";

export default function Home() {
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
        <div className="container mx-auto py-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: {selectedPath ? `${selectedPath.title} Practice` : "Learning Platform"}
          </h1>
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


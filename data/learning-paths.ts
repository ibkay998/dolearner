"use client";

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name from Lucide icons
  color: string; // Tailwind color class for the path
  order: number; // For sorting paths
}

export const learningPaths: LearningPath[] = [
  {
    id: "react",
    title: "React",
    description: "Learn React by building UI components from scratch",
    icon: "Code", // Lucide icon name
    color: "from-blue-600 to-indigo-600", // Gradient colors for React
    order: 1,
  },
  {
    id: "css",
    title: "CSS",
    description: "Master CSS by completing styling challenges",
    icon: "Palette", // Lucide icon name
    color: "from-purple-600 to-pink-600", // Gradient colors for CSS
    order: 2,
  },
  // More paths can be added here in the future
];

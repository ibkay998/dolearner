"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { LearningPathSelection } from "@/components/learning-path-selection";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  // Show confirmation message if user was redirected after email confirmation
  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      toast({
        title: "Welcome to DoLearner!",
        description: "Your email has been confirmed. You can now track your progress!",
      });
      // Clean up the URL
      router.replace('/');
    }
  }, [searchParams, toast, router]);

  const handleSelectPath = (pathId: string) => {
    router.push(`/challenges/${pathId}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: Learning Platform
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

      <LearningPathSelection onSelectPath={handleSelectPath} />
    </main>
  );
}


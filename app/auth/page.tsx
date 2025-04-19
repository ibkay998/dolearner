"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContainer } from "@/components/auth-container";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: Account
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto py-8">
        <AuthContainer />
      </div>
    </main>
  );
}

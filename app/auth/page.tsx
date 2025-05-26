"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContainer } from "@/components/auth-container";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useSupabase } from "@/components/supabase-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

// Component that handles search params and needs Suspense
function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSupabaseAuth();
  const { supabase } = useSupabase();
  const { toast } = useToast();

  // Handle email confirmation
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('Error confirming email:', error);
            toast({
              title: "Email confirmation failed",
              description: error.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Email confirmed successfully",
              description: "Your account has been verified!",
            });
          }
        } catch (error) {
          console.error('Error during email confirmation:', error);
          toast({
            title: "Email confirmation failed",
            description: "An unexpected error occurred",
            variant: "destructive",
          });
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, supabase, toast]);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <div className="container mx-auto py-8">
      <AuthContainer />
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();

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

      <Suspense fallback={
        <div className="container mx-auto py-8">
          <Loading text="Loading authentication..." />
        </div>
      }>
        <AuthPageContent />
      </Suspense>
    </main>
  );
}

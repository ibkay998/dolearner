"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/components/user-profile";
import { EnrolledPathsDashboard } from "@/components/enrolled-paths-dashboard";
import { PathEnrollmentSelection } from "@/components/path-enrollment-selection";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useUserPathEnrollments } from "@/hooks/use-user-path-enrollments";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Loading } from "@/components/ui/loading";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth();
  const { hasAnyEnrollments, loading: enrollmentsLoading } = useUserPathEnrollments();
  const [showPathSelection, setShowPathSelection] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Show path selection if user has no enrollments (instead of redirecting)
  const shouldShowInitialSetup = !authLoading && !enrollmentsLoading && user && !hasAnyEnrollments && !showPathSelection;

  const handleAddPaths = useCallback(() => {
    setShowPathSelection(true);
  }, []);

  const handleEnrollmentComplete = useCallback(() => {
    setShowPathSelection(false);
  }, []);

  if (authLoading || enrollmentsLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading your profile..." size="lg" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: My Profile
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
        {showPathSelection || shouldShowInitialSetup ? (
          <PathEnrollmentSelection
            onEnrollmentComplete={handleEnrollmentComplete}
            isInitialSetup={!!shouldShowInitialSetup}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <UserProfile />
            </div>
            <div className="md:col-span-2">
              <EnrolledPathsDashboard onAddPaths={handleAddPaths} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

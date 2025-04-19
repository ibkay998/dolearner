"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { AuthForm } from "@/components/auth-form";
import { UserProfile } from "@/components/user-profile";
import { Loading } from "@/components/ui/loading";

export function AuthContainer() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();

  // Redirect to profile if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading size="lg" className="p-8" />;
  }

  return <AuthForm />;
}

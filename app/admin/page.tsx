"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Users,
  BarChart3,
  FolderOpen,
  ArrowLeft
} from "lucide-react";
import { PathCategoriesManager } from "@/components/admin/path-categories-manager";
import { LearningPathsManager } from "@/components/admin/learning-paths-manager";
import { ChallengesManager } from "@/components/admin/challenges-manager";
import { TestCasesManager } from "@/components/admin/test-cases-manager";
import { UserAnalytics } from "@/components/admin/user-analytics";
import { ReactQueryProvider } from "@/lib/react-query";
import { useAdminStats } from "@/hooks/use-admin-data";
import { supabase } from "@/lib/supabase";

// Admin Dashboard Content Component (uses React Query)
function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();

  if (statsError) {
    console.error('Error loading admin stats:', statsError);
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DoLearner: Admin Dashboard
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Platform
          </Button>
        </div>
      </header>

      <div className="container mx-auto py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalPaths || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalChallenges || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalCompletions || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="tests">Test Cases</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Path Categories Management</CardTitle>
                <CardDescription>
                  Organize learning paths into categories like Frontend, DSA, Backend, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PathCategoriesManager onStatsUpdate={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paths">
            <Card>
              <CardHeader>
                <CardTitle>Learning Paths Management</CardTitle>
                <CardDescription>
                  Create and manage learning paths for different technologies and skill levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LearningPathsManager onStatsUpdate={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <Card>
              <CardHeader>
                <CardTitle>Challenges Management</CardTitle>
                <CardDescription>
                  Create, edit, and organize challenges within learning paths.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChallengesManager onStatsUpdate={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle>Test Cases Management</CardTitle>
                <CardDescription>
                  Manage test cases for challenges to ensure proper evaluation of user solutions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestCasesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>
                  View user progress, completion rates, and platform usage statistics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, permissions')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges.",
            variant: "destructive",
          });
          router.push("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading admin dashboard..." size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <ReactQueryProvider>
      <AdminDashboardContent />
    </ReactQueryProvider>
  );
}
